# 影视平台全栈项目

## 项目结构
- `frontend/` — Next.js 14 App Router, TailwindCSS, YouTube 暗色主题
- `backend/` — Spring Boot 3.2, JPA, JWT, MySQL, Redis
- `docs/` — 界面设计规范 + 应用架构文档
- `docker-compose.yml` — MySQL 8.0 + Redis 7
- `start-all.bat` / `start-backend.bat` / `start-frontend.bat` — 启动脚本
- `stop-all.bat` — 一键停止

## 关键约定
- 前端样式：100% TailwindCSS，不写自定义 CSS
- 后端 API：统一返回 `{success, code, message, data}`
- 数据库：MySQL `movie_platform` 库，100 部豆瓣影数据
- 认证：JWT，admin/admin123, user/user123
- 海报：豆瓣 CDN 图片必须加 `referrerPolicy="no-referrer"`
- 响应式：sm/md/lg/xl/2xl 五档

## 子目录独立开发
- 在 `frontend/` 中启动的 Claude Code 只能修改前端代码
- 在 `backend/` 中启动的 Claude Code 只能修改后端代码
- 在根目录启动的 Claude Code 可以修改全局（docker-compose、脚本、文档）
