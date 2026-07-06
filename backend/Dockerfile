# ==============================================================
# 影视平台后端 · Docker 多阶段构建
# 阶段 1: Maven 构建  →  阶段 2: JRE 运行
# ==============================================================

FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# 先复制 pom.xml，利用 Docker 缓存层加速重复构建
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# 复制源码并构建（跳过测试）
COPY src ./src
RUN mvn package -DskipTests -B -q

# ==============================================================
FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app

# 创建非 root 用户运行
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

USER app
ENTRYPOINT ["java", "-jar", "app.jar"]
