package com.example.movieplatform.config;

import com.example.movieplatform.entity.User;
import com.example.movieplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 初始化种子用户数据（开发环境用）
 * 对已有用户重新设置密码为正确的 BCrypt 哈希
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initUser("admin", "admin123", User.Role.ADMIN);
        initUser("user", "user123", User.Role.USER);
        log.info("✅ 种子用户初始化完成");
    }

    private void initUser(String username, String rawPassword, User.Role role) {
        userRepository.findByUsername(username).ifPresentOrElse(
            user -> {
                // 开发环境：每次启动都重新设置密码和邮箱
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setEmail(username + "@movie.com");
                userRepository.save(user);
                log.info("🔐 已重置用户 {} 的密码", username);
            },
            () -> {
                // 用户不存在，创建
                User newUser = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(rawPassword))
                    .email(username + "@movie.com")
                    .role(role)
                    .build();
                userRepository.save(newUser);
                log.info("👤 已创建用户: {} ({})", username, role);
            }
        );
    }
}
