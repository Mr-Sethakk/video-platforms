# 🎬 影视平台 · 全栈应用

> **YouTube 风格暗色主题** · Next.js 14 + Spring Boot 3.2 + MySQL + Redis + AI 智能体

一个面向 C 端用户的影视内容平台，支持电影浏览/搜索/收藏、AI 智能客服对话、海报识别、内容审核上架等完整业务闭环。

---

## 🖥️ 在线预览

| 页面 | 路径 |
|------|------|
| 首页（无限滚动） | `/` |
| 电影列表（筛选排序） | `/movies` |
| 电影详情 | `/movies/[id]` |
| 搜索结果 | `/search?q=xxx` |
| 我的片单 | `/watchlist` |
| AI 聊天助手 | 右下悬浮按钮 |
| 登录 | `/login` |
| 管理后台 | `/admin` |
| 视频审核 | `/admin/review` |

### 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `admin123` |
| 普通用户 | `user` | `user123` |

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Next.js 14 (App Router) | React SSR/SSG |
| **样式方案** | TailwindCSS 3.4 | 原子化 CSS，全站暗色 |
| **UI 图标** | Lucide Icons | 24px / strokeWidth 1.5 |
| **状态管理** | React Hooks + Context | 轻量级 |
| **后端框架** | Spring Boot 3.2 | Java 企业级 |
| **ORM** | Spring Data JPA | Hibernate |
| **安全** | Spring Security + JWT | 无状态认证 |
| **数据库** | MySQL 8.0 | 关系型数据库 |
| **缓存** | Redis 7 | 热点数据缓存 |
| **AI 集成** | DashScope（通义千问） | 可插拔 |
| **基础设施** | Docker Compose | MySQL + Redis |

---

## 📂 项目结构

```
video-platforms/
├── frontend/                    # Next.js 14 前端
│   ├── app/                     # App Router 页面
│   │   ├── layout.js            # 根布局
│   │   ├── page.js              # 首页
│   │   ├── movies/              # 电影列表 & 详情
│   │   ├── search/              # 搜索结果
│   │   ├── watchlist/           # 我的片单
│   │   ├── admin/               # 管理后台 & 审核
│   │   ├── login/               # 登录
│   │   ├── register/            # 注册
│   │   └── api/                 # BFF API Routes
│   ├── components/              # 组件
│   │   ├── layout/              # TopBar / Sidebar / Chips / AI浮窗
│   │   ├── movie/               # MovieCard / MovieGrid / SortBar
│   │   ├── chat/                # ChatBox / ChatMessage / ChatInput
│   │   ├── auth/                # LoginForm / RegisterForm
│   │   ├── admin/               # StatCard / DashboardChart / ReviewCard
│   │   ├── upload/              # ImageUpload / PosterRecognition
│   │   └── ui/                  # Skeleton / Empty / Toast / Modal
│   ├── hooks/                   # useAuth / useMovies / useWatchlist / useChat
│   ├── lib/                     # api.js / constants.js
│   └── styles/                  # globals.css
├── backend/                     # Spring Boot 3.2 后端
│   └── src/main/java/com/example/movieplatform/
│       ├── config/              # Security / CORS / DataInit
│       ├── security/            # JWT Provider / Filter
│       ├── entity/              # User / Movie / Watchlist
│       ├── dto/                 # Request / Response DTOs
│       ├── repository/          # JPA Repository
│       ├── service/             # Business Logic
│       ├── controller/          # REST Controllers
│       └── exception/           # Global Error Handling
├── docker-compose.yml           # MySQL + Redis
├── start-all.bat                # 一键启动全部
├── start-backend.bat            # 只启动后端
└── start-frontend.bat           # 只启动前端
```

---

## 🚀 快速启动

### 前置要求

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | 前端运行 |
| JDK | 17+ (建议 21) | 后端编译运行 |
| Maven | 3.9+ | 后端依赖构建 |
| Docker Desktop | 最新版 | MySQL + Redis 基础设施 |

### 1. 克隆项目

```bash
git clone https://github.com/Mr-Sethakk/video-platforms.git
cd video-platforms
```

### 2. 启动基础设施

```bash
docker compose up -d
```

### 3. 配置环境变量

**前端** `frontend/.env.local`：
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**后端** `backend/src/main/resources/application.yml`：
- MySQL 用户名/密码默认 `root/root`，如需修改同步更新 docker-compose.yml

### 4. 一键启动

**Windows（推荐）：**
```
双击 start-all.bat
```

**手动启动：**
```bash
# 后端
cd backend
mvn spring-boot:run      # 端口 8080

# 前端（新终端）
cd frontend
npm install
npm run dev              # 端口 3000
```

### 5. 访问

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
| 后端 API | http://localhost:8080 |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

---

## 🎨 设计规范

本项目的设计体系以 **YouTube 暗色模式** 为唯一参考基准：

| 设计元素 | 规格 |
|----------|------|
| 背景色 | `#0F0F0F` |
| 卡片背景 | `#212121` |
| 品牌色 | `#6366F1`（靛蓝） |
| 评分色 | `#F59E0B`（琥珀） |
| 字体 | Roboto → PingFang SC → Microsoft YaHei |
| 电影海报 | 2:3 网格（首页）/ 16:9 横图（推荐栏） |
| 侧边栏 | 展开 240px / 折叠 64px |
| 圆角 | 卡片 `rounded-xl` / 按钮 `rounded-full` |
| 动效 | 无缩放 Hover，brightness 微调 |

详细设计文档见 `暑假实习/界面设计.md` 和 `暑假实习/应用架构文档.md`。

---

## 📡 API 端点

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/movies` | 电影列表（分页、筛选、排序） |
| GET | `/api/movies/{id}` | 电影详情 |
| GET | `/api/movies/genres` | 类型列表 |
| GET | `/api/movies/search?q=` | 关键词搜索 |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录（返回 JWT） |
| POST | `/api/ai/chat` | AI 对话（SSE 流式） |

### 需认证

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/watchlist` | 获取片单 |
| POST | `/api/watchlist` | 添加到片单 |
| DELETE | `/api/watchlist/{movieId}` | 从片单移除 |

### 管理员

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/stats` | 仪表盘统计 |
| GET | `/api/admin/videos/pending` | 待审核列表 |
| PUT | `/api/admin/videos/{id}/approve` | 审核通过 |
| PUT | `/api/admin/videos/{id}/reject` | 审核拒绝 |

所有接口返回统一格式：
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

---

## 🔐 安全设计

- JWT 无状态认证，24 小时过期
- BCrypt 密码加密（强度 10）
- Spring Security 方法级权限控制
- CORS 白名单（仅允许前端域名）
- 参数化查询（防 SQL 注入）
- React 默认 XSS 防护

---

## 📝 开发说明

### 前端模式

前端内置了 Next.js API Routes 作为 BFF 层，包含完整的模拟数据。这意味着即使不启动后端，前端也可以独立预览：

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000（使用内存模拟数据）
```

要连接真实后端，修改 `frontend/.env.local`：
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### AI 模块

AI 聊天目前使用关键词匹配的模拟响应。要接入真实的 DashScope（通义千问）API：

1. 在 [阿里云百炼平台](https://bailian.console.aliyun.com) 获取 API Key
2. 设置环境变量 `DASHSCOPE_API_KEY=sk-xxxxx`
3. 取消 `pom.xml` 中 Spring AI Alibaba 依赖的注释
4. 重新编译启动

---

## 📦 技术文档

- 界面设计规范：`暑假实习/界面设计.md`
- 应用架构文档：`暑假实习/应用架构文档.md`
- 数据库初始化：`backend/src/main/resources/db/schema.sql`

---

> 📅 项目生成日期：2026-07-04
> 🎯 基于暑假实习「电影APP全栈开发 + AI智能体」课程大纲
