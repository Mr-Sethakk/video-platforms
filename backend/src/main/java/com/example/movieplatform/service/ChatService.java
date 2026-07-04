package com.example.movieplatform.service;

import com.example.movieplatform.dto.request.ChatRequest;
import reactor.core.publisher.Flux;

public interface ChatService {

    Flux<String> chat(ChatRequest request);

    Flux<String> chatStream(ChatRequest request);
}
