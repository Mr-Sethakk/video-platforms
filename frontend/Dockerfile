# ==============================================================
# 影视平台前端 · Docker 多阶段构建
# 阶段 1: 依赖安装  →  阶段 2: 构建  →  阶段 3: 运行
# ==============================================================

FROM node:18-alpine AS base
WORKDIR /app

# ---- 依赖阶段 ----
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ---- 构建阶段 ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 浏览器通过 localhost:8080 访问后端（Docker 端口映射）
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- 运行阶段 ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -S app && adduser -S app -G app

# Next.js standalone 模式输出
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

USER app
CMD ["node", "server.js"]
