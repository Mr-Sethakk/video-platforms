# 🎬 影视平台 · 全栈应用

> **YouTube 风格暗色主题** · Next.js 14 + Spring Boot 3.2 + MySQL + Redis + AI 智能体

一个面向 C 端用户的影视内容平台，支持电影浏览 / 智能搜索 / 视频播放 / 收藏、AI 智能客服、海报识图找片、VIP 会员体系、管理后台等完整业务闭环。

---

## 📋 目录

- [页面总览](#-页面总览)
- [快速开始（Docker）](#-快速开始docker) ⬅️ 推荐
- [本地开发](#-本地开发)
- [配置 AI 功能](#-配置-ai-功能)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [演示账号](#-演示账号)
- [API 端点](#-api-端点)

---

## 🖥️ 页面总览

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 无限滚动 + CategoryChips 分类筛选 |
| 电影列表 | `/movies` | 排序/筛选/分类 |
| 电影详情 | `/movies/[id]` | 视频播放器 + 海报 + 简介 + 评论 |
| 搜索结果 | `/search?q=xxx` | 智能联想 + 搜索历史 + 无结果推荐 |
| 我的片单 | `/watchlist` | 收藏管理（需登录） |
| AI 聊天 | 右下悬浮按钮 | DeepSeek 流式对话 + Markdown |
| 海报识图 | 搜索栏旁 📷 | DashScope 多模态识别 |
| 登录/注册 | `/login` `/register` | JWT 认证 |
| 会员中心 | `/membership` | VIP/VVIP/SVIP 三档充值 |
| 管理后台 | `/admin` | 统计仪表盘 + 视频管理 + 上传 + 审核 |

---

## 🐳 快速开始（Docker）

**只需安装 Docker Desktop**，无需 JDK / Maven / Node.js / MySQL / Redis。

```bash
# 1. 克隆项目
git clone https://github.com/Mr-Sethakk/video-platforms.git
cd video-platforms

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，按需填入 API Key（见下方"配置 AI 功能"）

# 3. 一键启动（首次构建约 3-5 分钟）
docker compose up -d

# 4. 等待 MySQL 初始化完成（约 30-60 秒），然后访问
# http://localhost:3000
```

**常用命令**：

```bash
docker compose up -d          # 启动所有服务
docker compose down           # 停止并删除容器
docker compose down -v        # 停止并删除容器 + 数据卷（重置数据库）
docker compose logs -f backend # 查看后端日志
docker compose logs -f frontend# 查看前端日志
docker compose restart backend # 重启后端
```

> 💡 首次启动时 MySQL 需要执行 `schema.sql` 建表并插入种子数据，请耐心等待 30-60 秒。如果前端提示"加载失败"，刷新页面稍等片刻即可。

---

## 💻 本地开发

如果你需要修改代码，可以用本地开发环境运行：

### 前置要求

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | 前端运行 |
| JDK | 17+ | 后端编译运行 |
| Maven | 3.9+ | 后端依赖构建 |
| Docker Desktop | 最新版 | MySQL + Redis |

### 启动步骤

```bash
# 1. 启动基础设施
docker compose up -d mysql redis

# 2. 配置后端环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入 API Key

# 3. 启动后端
cd backend
mvn spring-boot:run         # 端口 8080

# 4. 启动前端（新终端）
cd frontend
npm install
npm run dev                 # 端口 3000
```

前端内置 Next.js API Routes 层 + 模拟数据，不启动后端也能独立预览基本页面（AI 等需要后端的功能除外）。

---

## 🤖 配置 AI 功能

AI 功能依赖第三方 API，**需自行注册获取 Key**。不配置不影响电影浏览、搜索、收藏、视频播放等核心功能。

### 功能对照

| 功能 | 需要的 Key | 注册地址 | 不配置的影响 |
|------|-----------|----------|-------------|
| AI 智能聊天 | DeepSeek API Key | [platform.deepseek.com](https://platform.deepseek.com) | 点击 AI 按钮无回复 |
| 海报识图找片 | DashScope API Key | [bailian.console.aliyun.com](https://bailian.console.aliyun.com) | 上传海报后无识别结果 |

### Docker 用户

编辑项目根目录的 `.env` 文件：

```env
DEEPSEEK_API_KEY=sk-你的DeepSeek-Key
DASHSCOPE_API_KEY=sk-你的DashScope-Key
```

修改后重启服务：

```bash
docker compose down
docker compose up -d
```

### 本地开发用户

编辑 `backend/.env` 文件，填入同上内容，重启后端即可。

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Next.js 14 (App Router) | React SSR/SSG |
| **样式方案** | TailwindCSS 3.4 | 原子化 CSS，全站暗色 |
| **UI 图标** | Lucide Icons | 24px / strokeWidth 1.5 |
| **状态管理** | React Hooks + Context | 轻量级 |
| **视频播放** | HTML5 `<video>` + 自定义控制栏 | 全屏/音量/进度记忆/VIP 锁屏 |
| **后端框架** | Spring Boot 3.2 | Java 企业级 |
| **ORM** | Spring Data JPA | Hibernate |
| **安全** | Spring Security + JWT | 无状态认证，方法级权限 |
| **数据库** | MySQL 8.0 | 100+ 豆瓣 Top 250 电影数据 |
| **缓存** | Redis 7 | 热点数据缓存 |
| **AI 对话** | DeepSeek Chat API | 流式 SSE |
| **AI 视觉** | DashScope (qwen-vl-max) | 海报识图找片 |
| **基础设施** | Docker Compose | 一键全栈部署 |

---

## 📂 项目结构

```
video-platforms/
├── frontend/                         # Next.js 14 前端
│   ├── app/                          # App Router（15 个页面路由）
│   ├── components/                   # 组件（7 个分类）
│   │   ├── layout/                   # TopBar / Sidebar / CategoryChips / AI 浮窗
│   │   ├── movie/                    # MovieCard / MovieGrid / SortBar
│   │   ├── search/                   # SearchDropdown（历史+联想+高亮）
│   │   ├── video/                    # VideoPlayer（控制栏+VIP 锁屏+进度记忆）
│   │   ├── chat/                     # ChatBox / ChatMessage / ChatInput / Markdown
│   │   ├── auth/ admin/ upload/     # 认证 / 管理 / 上传
│   │   └── ui/                       # Skeleton / Empty / Toast / Modal
│   ├── hooks/                        # 6 个自定义 Hook
│   ├── lib/                          # api.js（JWT+SSE）/ constants.js
│   ├── public/videos/                # 7 个视频文件
│   ├── Dockerfile                    # 前端 Docker 构建
│   └── styles/                       # globals.css
├── backend/                          # Spring Boot 3.2 后端
│   ├── src/main/java/com/example/movieplatform/
│   │   ├── config/                   # Security / CORS / WebClient / DataInit
│   │   ├── security/                 # JWT Provider / Filter
│   │   ├── entity/                   # User / Movie / Watchlist / Comment / Video
│   │   ├── dto/                      # Request / Response DTOs
│   │   ├── repository/               # JPA Repository（5 个）
│   │   ├── service/                  # 业务逻辑（6 组）
│   │   ├── controller/               # 8 个 REST Controller
│   │   └── exception/                # BusinessException + GlobalHandler
│   ├── src/main/resources/
│   │   ├── application.yml           # Spring Boot 配置
│   │   └── db/schema.sql             # 数据库 DDL + 种子数据
│   ├── Dockerfile                    # 后端 Docker 构建
│   ├── .env.example                  # 后端环境变量模板
│   └── pom.xml
├── docs/                             # 设计文档
│   ├── 界面设计.md                    # YouTube 风格 UI 规范 v3.0
│   └── 应用架构文档.md                # 全栈架构文档 v1.0
├── docker-compose.yml                # Docker 全栈编排（MySQL + Redis + Backend + Frontend）
├── .env.example                      # 环境变量模板
└── start-all.bat                     # Windows 一键启动脚本
```

---

## 🔑 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `admin123` |
| 普通用户 | `user` | `user123` |

---

## 📡 API 端点

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/movies` | 电影列表（分页、筛选、排序） |
| GET | `/api/movies/{id}` | 电影详情（含视频字段） |
| GET | `/api/movies/genres` | 类型列表 |
| GET | `/api/search/suggestions?q=` | 智能搜索联想 |
| GET | `/api/posters/{movieId}` | 电影海报图片 |
| GET | `/api/videos/{id}` | 视频详情（VIP 鉴权） |
| GET | `/api/comments?movieId=X` | 评论列表 |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录（返回 JWT） |
| POST | `/api/ai/chat` | AI 对话（SSE 流式） |
| POST | `/api/ai/poster/recognize` | 海报识图找片 |

### 需认证

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/watchlist` | 获取片单 |
| POST | `/api/watchlist` | 添加到片单 |
| DELETE | `/api/watchlist/{movieId}` | 从片单移除 |
| POST | `/api/comments` | 发表评论 |

### 管理员

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/stats` | 仪表盘统计 |
| GET/POST/DELETE | `/api/admin/videos` | 视频管理 |
| PUT | `/api/admin/videos/{id}/approve` | 审核通过 |
| PUT | `/api/admin/videos/{id}/reject` | 审核拒绝 |

所有接口统一返回格式：
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

---

## 🎨 设计规范

以 **YouTube 暗色模式** 为唯一参考基准：

| 设计元素 | 规格 |
|----------|------|
| 背景色 | `#0F0F0F` |
| 品牌色 | `#6366F1`（靛蓝） |
| 评分色 | `#F59E0B`（琥珀） |
| 电影海报 | 2:3 网格 / 16:9 横图 |
| 侧边栏 | 展开 240px / 折叠 64px |
| 圆角 | 卡片 `rounded-xl` / 按钮 `rounded-full` |

详见 `docs/界面设计.md`。

---

## 🔐 安全设计

- JWT 无状态认证，24 小时过期
- BCrypt 密码加密（强度 10）
- Spring Security 方法级权限控制
- CORS 白名单
- 参数化查询防 SQL 注入
- 所有 API Key 通过环境变量注入，不写入代码

---

> 📅 最后更新：2026-07-06
> 🎯 基于暑假实习「电影APP 全栈开发 + AI 智能体」课程大纲
> 🔗 GitHub: [https://github.com/Mr-Sethakk/video-platforms](https://github.com/Mr-Sethakk/video-platforms)
