package com.example.movieplatform.service;

import com.example.movieplatform.dto.request.LoginRequest;
import com.example.movieplatform.dto.request.RegisterRequest;
import com.example.movieplatform.entity.User;

import java.util.Map;

public interface UserService {

    User register(RegisterRequest request);

    Map<String, Object> login(LoginRequest request);

    User getCurrentUser();
}
