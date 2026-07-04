package com.example.movieplatform.service.impl;

import com.example.movieplatform.dto.request.ChatRequest;
import com.example.movieplatform.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class ChatServiceImpl implements ChatService {

    private static final String SYSTEM_PROMPT = """
            你是"小影"，一个专业的电影推荐助手。你的职责是：
            1. 根据用户的偏好和需求推荐合适的电影
            2. 提供电影的相关信息，包括剧情简介、评分、演职员等
            3. 回答用户关于电影的各类问题
            4. 与用户进行友好的聊天互动

            请用中文回复，语气亲切友好，像个电影爱好者朋友一样。
            """;

    private static final Map<String, String> MOVIE_RECOMMENDATIONS = new HashMap<>();

    static {
        MOVIE_RECOMMENDATIONS.put("科幻", "推荐您观看《星际穿越》——诺兰导演的科幻神作，豆瓣评分9.4分！讲述人类穿越虫洞寻找新家园的故事，视觉效果震撼，情感深刻。");
        MOVIE_RECOMMENDATIONS.put("动画", "推荐您观看《千与千寻》——宫崎骏的经典之作，豆瓣评分9.4分！奇幻的异世界冒险，治愈又充满想象力。");
        MOVIE_RECOMMENDATIONS.put("动作", "推荐您观看《盗梦空间》——又一部诺兰神作，豆瓣评分9.3分！多层梦境的设定让人脑洞大开，动作场面精彩绝伦。");
        MOVIE_RECOMMENDATIONS.put("爱情", "推荐您观看《泰坦尼克号》——永恒的爱情经典，豆瓣评分9.4分！Jack和Rose的爱情感动了全世界。");
        MOVIE_RECOMMENDATIONS.put("喜剧", "推荐您观看《三傻大闹宝莱坞》——印度神片，豆瓣评分9.2分！笑中带泪的教育反思，值得一看再看。");
        MOVIE_RECOMMENDATIONS.put("悬疑", "推荐您观看《看不见的客人》——西班牙悬疑佳作，豆瓣评分8.8分！层层反转，不到最后一刻猜不到真相。");
        MOVIE_RECOMMENDATIONS.put("恐怖", "推荐您观看《闪灵》——库布里克经典恐怖片，豆瓣评分8.3分！心理恐怖的巅峰之作，氛围绝佳。");
        MOVIE_RECOMMENDATIONS.put("剧情", "推荐您观看《肖申克的救赎》——影史排名第一的神作，豆瓣评分9.7分！关于希望与自由的永恒主题。");
    }

    @Override
    public Flux<String> chat(ChatRequest request) {
        String message = request.getMessage();
        log.info("收到聊天消息: {}", message);

        String response = generateResponse(message);

        // Simulate SSE streaming with character-by-character output
        return Flux.fromArray(response.split(""))
                .delayElements(Duration.ofMillis(30))
                .startWith("data: ")
                .concatWithValues("\n\n[DONE]");
    }

    @Override
    public Flux<String> chatStream(ChatRequest request) {
        String message = request.getMessage();
        log.info("收到流式聊天消息: {}", message);

        String response = generateResponse(message);

        return Flux.fromArray(response.split(""))
                .delayElements(Duration.ofMillis(25));
    }

    private String generateResponse(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "您好！我是小影，您的电影推荐助手。请告诉我您想找什么类型的电影，或者有什么电影相关的问题，我很乐意帮助您！";
        }

        String lowerMessage = message.toLowerCase();

        // Check for greeting
        if (lowerMessage.contains("你好") || lowerMessage.contains("hello") || lowerMessage.contains("hi")) {
            return "你好呀！我是小影，很高兴认识你！告诉我你喜欢的电影类型，或者最近在找什么片子，我帮你推荐~";
        }

        // Check for genre keywords
        for (Map.Entry<String, String> entry : MOVIE_RECOMMENDATIONS.entrySet()) {
            if (lowerMessage.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        // Check for common movie-related questions
        if (lowerMessage.contains("推荐") || lowerMessage.contains("好看") || lowerMessage.contains("有什么")) {
            return "让我想想...根据大众口碑，以下电影值得一看：\n"
                    + "1. 《肖申克的救赎》- 剧情/希望 9.7分\n"
                    + "2. 《星际穿越》- 科幻/冒险 9.4分\n"
                    + "3. 《千与千寻》- 动画/奇幻 9.4分\n"
                    + "4. 《盗梦空间》- 科幻/动作 9.3分\n"
                    + "5. 《三傻大闹宝莱坞》- 喜剧/剧情 9.2分\n\n"
                    + "你对哪个类型更感兴趣呢？";
        }

        if (lowerMessage.contains("评分") || lowerMessage.contains("排行")) {
            return "目前本平台评分最高的几部电影是：\n"
                    + "1. 《肖申克的救赎》- 9.7分\n"
                    + "2. 《星际穿越》- 9.4分\n"
                    + "3. 《千与千寻》- 9.4分\n"
                    + "4. 《泰坦尼克号》- 9.4分\n"
                    + "5. 《盗梦空间》- 9.3分";
        }

        // Default response
        return "感谢您的提问！作为电影推荐助手，我可以帮您：\n"
                + "- 根据类型推荐电影（如科幻、动画、动作等）\n"
                + "- 查看高评分电影排行\n"
                + "- 了解特定电影的信息\n\n"
                + "请告诉我您感兴趣的电影类型，或者想看哪方面的推荐吧！";
    }
}
