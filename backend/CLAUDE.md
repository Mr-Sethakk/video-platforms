# 影视平台后端

## 技术栈
- Spring Boot 3.2, Java 17+, Spring Security, Spring Data JPA
- MySQL 8.0, Redis 7, JWT (jjwt 0.12)
- Lombok, Hibernate

## 设计规范
详见 `../docs/应用架构文档.md`

## 核心约定
- 所有接口统一响应格式: `{success, code, message, data}`
- 分页: `{records, total, page, pageSize, totalPages}`
- JWT 无状态认证, 24小时过期
- 密码 BCrypt 加密 (强度10)
- 角色: USER / ADMIN
- 公共接口: GET /api/movies/**, POST /api/auth/**, POST /api/ai/**
- 认证接口: /api/watchlist/**
- 管理员: /api/admin/** (hasRole ADMIN)

## 数据库
- MySQL: movie_platform 库, root/root
- Redis: localhost:6379
- 100部豆瓣电影数据已内置
- DataInitializer 每次启动自动重置 admin/admin123 和 user/user123 密码

## 目录
- config/ — SecurityConfig, CorsConfig, DataInitializer
- controller/ — REST Controllers
- service/impl/ — 业务逻辑
- repository/ — JPA Repository
- entity/ — JPA Entity
- dto/ — Request/Response DTOs
- security/ — JwtTokenProvider, JwtAuthenticationFilter

## 编译与端口
- JDK 21: D:\JDK21
- Maven: D:\maven\maven-mvnd-2.0.0-rc-3-windows-amd64\mvn\bin
- mvn spring-boot:run → http://localhost:8080
- JPA ddl-auto: none (使用预建表)
