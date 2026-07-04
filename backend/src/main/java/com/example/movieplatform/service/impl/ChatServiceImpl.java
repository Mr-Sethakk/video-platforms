package com.example.movieplatform.service.impl;

import com.example.movieplatform.dto.request.ChatRequest;
import com.example.movieplatform.entity.Movie;
import com.example.movieplatform.repository.MovieRepository;
import com.example.movieplatform.service.ChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.*;

@Slf4j
@Service
public class ChatServiceImpl implements ChatService {

    private final MovieRepository movieRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${deepseek.api-key}")
    private String apiKey;

    @Value("${deepseek.base-url}")
    private String baseUrl;

    @Value("${deepseek.model}")
    private String model;

    private String movieContext = "";

    public ChatServiceImpl(MovieRepository movieRepository,
                           WebClient.Builder webClientBuilder,
                           ObjectMapper objectMapper) {
        this.movieRepository = movieRepository;
        this.webClientBuilder = webClientBuilder;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void buildMovieContext() {
        try {
            var page = movieRepository.findAllOrderByRatingDesc(PageRequest.of(0, 30));
            StringBuilder sb = new StringBuilder();
            sb.append("以下是平台目前评分最高的部分电影：\n\n");
            for (Movie m : page.getContent()) {
                sb.append(String.format("- 《%s》(%d) | ⭐%.1f | %s | 导演：%s | %d分钟 | %s\n",
                        m.getTitle(),
                        m.getYear() != null ? m.getYear() : 0,
                        m.getRating() != null ? m.getRating() : 0,
                        m.getGenre() != null ? m.getGenre() : "",
                        m.getDirector() != null ? m.getDirector() : "未知",
                        m.getDuration() != null ? m.getDuration() : 0,
                        m.getCountry() != null ? m.getCountry() : ""));
            }
            movieContext = sb.toString();
            log.info("电影知识库加载完成：{} 部电影", page.getContent().size());
        } catch (Exception e) {
            log.warn("加载电影知识库失败：{}", e.getMessage());
            movieContext = "";
        }
    }

    private String buildSystemPrompt() {
        return """
                你是"小影"，一个热情专业的中文电影推荐助手，工作在"电影APP"平台。

                你的能力：
                1. 根据用户偏好推荐电影（结合评分、类型、年代）
                2. 介绍电影的详细信息（剧情、导演、演员、获奖等）
                3. 回答电影相关的知识和趣闻
                4. 与用户自然闲聊

                回答要求：
                - 推荐时优先使用平台内的电影，每次推荐不超过 3 部，给出具体推荐理由
                - 使用友好的语气，适当使用 emoji
                - 用户情绪低落时给予安慰和鼓励
                - 回复简洁有温度，不超过 300 字

                """ + movieContext;
    }

    @Override
    public Flux<String> chat(ChatRequest request) {
        return doChat(request, true);
    }

    @Override
    public Flux<String> chatStream(ChatRequest request) {
        return doChat(request, false);
    }

    private Flux<String> doChat(ChatRequest request, boolean sseFormat) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            String welcome = "你好呀！我是小影 🎬 想找什么电影？";
            return Flux.just(sseFormat ? "data: " + welcome + "\n\n" : welcome);
        }

        // Build messages
        List<Map<String, String>> msgs = new ArrayList<>();
        msgs.add(Map.of("role", "system", "content", buildSystemPrompt()));
        if (request.getHistory() != null) {
            int max = Math.min(request.getHistory().size(), 20);
            for (int i = request.getHistory().size() - max; i < request.getHistory().size(); i++) {
                var h = request.getHistory().get(i);
                if (h.getRole() != null && h.getContent() != null) {
                    msgs.add(Map.of("role", h.getRole(), "content", h.getContent()));
                }
            }
        }
        msgs.add(Map.of("role", "user", "content", request.getMessage()));

        Map<String, Object> body = Map.of(
                "model", model, "messages", msgs,
                "stream", false, // non-streaming for reliability
                "temperature", 0.7, "max_tokens", 800
        );

        log.info("AI 请求：{}", request.getMessage().substring(0, Math.min(50, request.getMessage().length())));

        WebClient client = webClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();

        Mono<String> responseMono = client.post()
                .uri("/v1/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(resp -> {
                    try {
                        List<Map<String, Object>> choices = (List<Map<String, Object>>) resp.get("choices");
                        if (choices != null && !choices.isEmpty()) {
                            Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
                            if (msg != null) {
                                return (String) msg.get("content");
                            }
                        }
                    } catch (Exception e) {
                        log.error("解析 AI 响应失败：{}", e.getMessage());
                    }
                    return "抱歉，AI 出了点小问题，请稍后再试 😅";
                })
                .doOnError(e -> log.error("AI 调用失败：{}", e.getMessage()))
                .onErrorReturn("抱歉，AI 暂时不可用，请稍后再试 😅");

        // Convert Mono to Flux, then simulate per-character streaming for SSE feel
        Flux<String> charFlux = responseMono.flatMapMany(fullText -> {
            if (fullText == null || fullText.isEmpty()) {
                return Flux.just("AI 没有返回内容，请换个问题试试 🙂");
            }
            // Split into chunks of ~3 characters for streaming feel
            List<String> chunks = new ArrayList<>();
            for (int i = 0; i < fullText.length(); i += 3) {
                int end = Math.min(i + 3, fullText.length());
                chunks.add(fullText.substring(i, end));
            }
            return Flux.fromIterable(chunks).delayElements(Duration.ofMillis(40));
        });

        if (sseFormat) {
            return charFlux
                    .map(chunk -> chunk.replaceAll("^\\s*data:\\s*", ""))  // strip any stray "data:" prefix
                    .filter(chunk -> !chunk.trim().isEmpty())
                    .map(chunk -> "data: " + chunk + "\n\n")
                    .concatWith(Flux.just("data: [DONE]\n\n"));
        }
        return charFlux;
    }
}
