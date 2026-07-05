package com.example.movieplatform.service.impl;

import com.example.movieplatform.entity.Movie;
import com.example.movieplatform.repository.MovieRepository;
import com.example.movieplatform.service.PosterRecognitionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PosterRecognitionServiceImpl implements PosterRecognitionService {

    private final MovieRepository movieRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${dashscope.api-key}")
    private String apiKey;

    @Value("${dashscope.base-url}")
    private String baseUrl;

    @Value("${dashscope.vision-model}")
    private String visionModel;

    public PosterRecognitionServiceImpl(MovieRepository movieRepository,
                                         WebClient.Builder webClientBuilder,
                                         ObjectMapper objectMapper) {
        this.movieRepository = movieRepository;
        this.webClientBuilder = webClientBuilder;
        this.objectMapper = objectMapper;
    }

    @Override
    public List<Map<String, Object>> recognize(byte[] imageBytes, String contentType) {
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        String dataUri = "data:" + contentType + ";base64," + base64Image;

        // 构建识别提示词
        String prompt = """
                请仔细识别这张电影海报，提取以下信息并以JSON格式返回（只返回JSON，不要其他内容）：
                {
                  "title": "电影中文名称",
                  "englishTitle": "电影英文名称（如果有的话，没有就填null）",
                  "year": 上映年份（整数）,
                  "confidence": 识别置信度（0到1之间的浮点数）
                }
                如果你无法确定这是什么电影，请返回：
                {
                  "title": null,
                  "englishTitle": null,
                  "year": null,
                  "confidence": 0
                }
                注意：只返回JSON，不要返回任何其他文字。""";

        // 构建请求体
        List<Map<String, Object>> content = new ArrayList<>();
        content.add(Map.of("type", "image_url",
                "image_url", Map.of("url", dataUri)));
        content.add(Map.of("type", "text", "text", prompt));

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(Map.of("role", "user", "content", content));

        Map<String, Object> body = Map.of(
                "model", visionModel,
                "messages", messages,
                "temperature", 0.1,
                "max_tokens", 500
        );

        log.info("开始调用 DashScope Vision API 识别海报... base64图片大小: {} bytes, 端点: {}/chat/completions",
                dataUri.length(), baseUrl);

        WebClient client = webClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .codecs(config -> config.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();

        try {
            Map<String, Object> response = client.post()
                    .uri("/chat/completions")
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(status -> !status.is2xxSuccessful(), clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .doOnNext(errBody -> log.error("DashScope API 返回错误状态码: {}, 响应体: {}",
                                            clientResponse.statusCode(), errBody))
                                    .then(reactor.core.publisher.Mono.error(
                                            new RuntimeException("DashScope API error: " + clientResponse.statusCode())))
                    )
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block(Duration.ofSeconds(60));

            if (response == null) {
                log.error("DashScope Vision API 返回 null");
                throw new RuntimeException("AI 服务返回空响应");
            }

            // 检查是否有错误信息
            if (response.containsKey("error")) {
                log.error("DashScope API 返回错误: {}", response.get("error"));
                throw new RuntimeException("AI 服务调用失败: " + response.get("error"));
            }

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                log.error("DashScope API 响应无 choices, 完整响应: {}", response);
                throw new RuntimeException("AI 未返回有效结果");
            }

            Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
            if (msg == null) {
                log.error("DashScope API 响应无 message, choice: {}", choices.get(0));
                throw new RuntimeException("AI 未返回消息内容");
            }

            String responseContent = (String) msg.get("content");
            if (responseContent == null || responseContent.trim().isEmpty()) {
                log.error("DashScope API 返回空内容, finish_reason: {}", choices.get(0).get("finish_reason"));
                throw new RuntimeException("AI 返回了空内容");
            }

            log.info("DashScope Vision API 返回: {}", responseContent);

            // 解析JSON响应
            JsonNode result = parseJson(responseContent);
            if (result == null) {
                log.warn("无法解析 AI 返回的 JSON: {}", responseContent);
                return List.of();
            }

            String title = result.has("title") && !result.get("title").isNull()
                    ? result.get("title").asText() : null;
            String englishTitle = result.has("englishTitle") && !result.get("englishTitle").isNull()
                    ? result.get("englishTitle").asText() : null;
            Integer year = result.has("year") && !result.get("year").isNull()
                    ? result.get("year").asInt() : null;
            double confidence = result.has("confidence")
                    ? result.get("confidence").asDouble() : 0.0;

            if (title == null || confidence < 0.3) {
                log.info("海报识别置信度过低或无标题，confidence={}, title={}, aiResponse={}",
                        confidence, title, responseContent);
                return List.of();
            }

            log.info("AI识别结果: title={}, year={}, confidence={}", title, year, confidence);

            // 在数据库中匹配电影
            List<Movie> matchedMovies = matchMovies(title, englishTitle, year);
            log.info("数据库匹配到 {} 部电影", matchedMovies.size());

            // 转换为响应格式
            return matchedMovies.stream()
                    .map(m -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("id", m.getId());
                        map.put("title", m.getTitle());
                        map.put("rating", m.getRating());
                        map.put("year", m.getYear());
                        map.put("genre", m.getGenre());
                        map.put("director", m.getDirector());
                        map.put("description", m.getDescription());
                        map.put("duration", m.getDuration());
                        map.put("country", m.getCountry());
                        map.put("posterUrl", m.getPosterUrl());
                        map.put("matchConfidence", confidence);
                        return map;
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("海报识别失败: {}", e.getMessage(), e);
            throw new RuntimeException("海报识别服务异常: " + e.getMessage(), e);
        }
    }

    /**
     * 解析AI返回的JSON字符串
     */
    private JsonNode parseJson(String content) {
        // 尝试提取JSON块
        String json = content.trim();
        if (json.startsWith("```")) {
            int start = json.indexOf("{");
            int end = json.lastIndexOf("}");
            if (start >= 0 && end > start) {
                json = json.substring(start, end + 1);
            }
        }
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.warn("解析JSON失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 在数据库中匹配电影
     * 优先级：1. 标题精确匹配 2. 标题模糊匹配 3. 英文标题匹配
     */
    private List<Movie> matchMovies(String title, String englishTitle, Integer year) {
        List<Movie> results = new ArrayList<>();
        List<Movie> allMovies = movieRepository.findAll();

        // 第1优先级：中文标题精确匹配
        for (Movie m : allMovies) {
            if (m.getTitle() != null && m.getTitle().equals(title)) {
                results.add(m);
            }
        }

        // 第2优先级：中文标题包含匹配
        for (Movie m : allMovies) {
            if (!results.contains(m) && m.getTitle() != null) {
                if (m.getTitle().contains(title) || title.contains(m.getTitle())) {
                    results.add(m);
                }
            }
        }

        // 第3优先级：年份匹配（模糊匹配）
        if (year != null && results.isEmpty()) {
            for (Movie m : allMovies) {
                if (m.getYear() != null && Math.abs(m.getYear() - year) <= 1
                        && m.getTitle() != null && levenshteinSimilarity(m.getTitle(), title) > 0.5) {
                    results.add(m);
                }
            }
        }

        // 第4优先级：纯文本相似度匹配
        if (results.isEmpty()) {
            for (Movie m : allMovies) {
                if (m.getTitle() != null && levenshteinSimilarity(m.getTitle(), title) > 0.6) {
                    results.add(m);
                }
            }
        }

        // 如果数据库匹配不到，返回空
        if (results.isEmpty()) {
            log.info("数据库中未匹配到电影: title={}, englishTitle={}, year={}", title, englishTitle, year);
        }

        return results;
    }

    /**
     * 计算两个字符串的编辑距离相似度
     */
    private double levenshteinSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0;
        String a = s1.toLowerCase().replaceAll("[\\s\\-·]", "");
        String b = s2.toLowerCase().replaceAll("[\\s\\-·]", "");

        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= b.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(dp[i - 1][j] + 1,
                        Math.min(dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost));
            }
        }

        int maxLen = Math.max(a.length(), b.length());
        return maxLen == 0 ? 1.0 : 1.0 - (double) dp[a.length()][b.length()] / maxLen;
    }
}
