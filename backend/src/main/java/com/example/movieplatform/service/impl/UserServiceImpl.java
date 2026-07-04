package com.example.movieplatform.service.impl;

import com.example.movieplatform.dto.request.LoginRequest;
import com.example.movieplatform.dto.request.RegisterRequest;
import com.example.movieplatform.entity.User;
import com.example.movieplatform.exception.BusinessException;
import com.example.movieplatform.repository.UserRepository;
import com.example.movieplatform.security.JwtTokenProvider;
import com.example.movieplatform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public User register(RegisterRequest request) {
        // Check duplicate username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(400, "用户名已存在");
        }

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(400, "邮箱已被注册");
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(User.Role.USER)
                .build();

        return userRepository.save(user);
    }

    @Override
    public Map<String, Object> login(LoginRequest request) {
        // Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(401, "用户名或密码错误"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        // Build response
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", user);
        return result;
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(401, "未登录");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Long userId) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(404, "用户不存在"));
        }

        throw new BusinessException(401, "未登录");
    }
}
