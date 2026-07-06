# 🎬 影视平台 · 全栈应用

> **YouTube 风格暗色主题** · Next.js 14 + Spring Boot 3.2 + MySQL + Redis + AI 智能体

一个面向 C 端用户的影视内容平台，支持电影浏览 / 智能搜索 / 视频播放 / 收藏、AI 智能客服、海报识图找片、VIP 会员体系、管理后台等完整业务闭环。

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
| **视频播放** | HTML5 `<video>` + 自定义控制栏 | 支持全屏/音量/进度记忆/VIP锁屏 |
| **后端框架** | Spring Boot 3.2 | Java 企业级 |
| **ORM** | Spring Data JPA | Hibernate |
| **安全** | Spring Security + JWT | 无状态认证，方法级权限 |
| **数据库** | MySQL 8.0 | 100 部豆瓣 Top 250 |
| **缓存** | Redis 7 | 热点数据缓存 |
| **AI 对话** | DeepSeek Chat API | 流式 SSE |
| **AI 视觉** | DashScope (通义千问 qwen-vl-max) | 海报识图找片 |
| **基础设施** | Docker Compose | MySQL + Redis |

---

## 📂 项目结构

```
video-platforms/
├── frontend/                         # Next.js 14 前端
│   ├── app/                          # App Router (15个页面路由)
│   │   ├── layout.js                 # 根布局
│   │   ├── page.js                   # 首页 (MovieGrid + 无限滚动)
│   │   ├── movies/                   # 电影列表 & 详情 (含视频播放器)
│   │   ├── search/                   # 搜索结果 (无结果推荐)
│   │   ├── watchlist/                # 我的片单
│   │   ├── admin/                    # 管理后台 / 视频管理 / 上传 / 审核
│   │   ├── login/ register/          # 认证
│   │   ├── profile/ membership/      # 用户 & VIP
│   │   ├── about/ help/              # 信息页
│   │   └── api/                      # BFF API Routes (含 mock 数据)
│   ├── components/                   # 组件 (7个分类)
│   │   ├── layout/                   # TopBar / Sidebar / CategoryChips / AI浮窗
│   │   ├── movie/                    # MovieCard (角标+VIP标签) / MovieGrid / SortBar
│   │   ├── search/                   # SearchDropdown (历史+联想+高亮)
│   │   ├── video/                    # VideoPlayer (控制栏+VIP锁屏+进度记忆)
│   │   ├── chat/                     # ChatBox / ChatMessage / ChatInput / Markdown
│   │   ├── auth/ admin/ upload/      # 认证 / 管理 / 上传
│   │   └── ui/                       # Skeleton / Empty / Toast / Modal
│   ├── hooks/                        # 6 个自定义 Hook
│   │   ├── useAuth.js                # 认证 + VIP (Context)
│   │   ├── useInfiniteMovies.js      # 无限滚动
│   │   ├── useWatchlist.js           # 收藏 (乐观更新+竞态防护)
│   │   ├── useChat.js                # AI 聊天 SSE
│   │   ├── useSearchHistory.js       # 搜索历史 (localStorage)
│   │   └── useDebounce.js            # 输入防抖
│   ├── lib/                          # api.js (JWT+SSE) / constants.js
│   ├── public/videos/                # 7 个视频文件 (6部预告片+1个演示)
│   └── styles/                       # globals.css
├── backend/                          # Spring Boot 3.2 后端
│   └── src/main/java/com/example/movieplatform/
│       ├── config/                   # Security / CORS / WebClient / DataInit
│       ├── security/                 # JWT Provider / Filter
│       ├── entity/                   # User / Movie / Watchlist / Comment / Video
│       ├── dto/                      # Request / Response DTOs
│       ├── repository/               # JPA Repository (5个)
│       ├── service/                  # 业务逻辑 (6组, getWatchlist返回Movie[])
│       ├── controller/               # 8 个 REST Controller
│       └── exception/                # BusinessException + GlobalHandler (按码映射HTTP)
├── docs/                             # 设计文档
│   ├── 界面设计.md                    # YouTube 风格 UI 规范 v3.0
│   └── 应用架构文档.md                # 全栈架构文档 v1.0
├── 功能设计文档/                      # 3 份功能详设 (搜索/识图/播放)
├── docker-compose.yml                # MySQL + Redis
├── start-all.bat                     # 一键启动全栈
└── 项目结构文档.md                    # 项目全貌 (v1.2.0)
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

**后端** — MySQL 默认 `root/root`，AI API Key 按需配置 `backend/.env`

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
| 可播放角标 | `#22C55E`（绿色） |
| 播放按钮 | `#FF0000`（红色） |
| VIP 标签 | 灰/琥珀/靛蓝/红 四档 |
| 字体 | Roboto → PingFang SC → Microsoft YaHei |
| 电影海报 | 2:3 网格（首页）/ 16:9 横图（推荐栏） |
| 视频播放器 | 16:9，自定义控制栏，3s 自动隐藏 |
| 侧边栏 | 展开 240px / 折叠 64px |
| 圆角 | 卡片 `rounded-xl` / 按钮 `rounded-full` |
| 动效 | 无缩放 Hover，brightness 微调 |

详细设计文档见 `docs/界面设计.md` 和 `docs/应用架构文档.md`。

---

## 📡 API 端点

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/movies` | 电影列表（分页、筛选、排序） |
| GET | `/api/movies/{id}` | 电影详情（含视频字段） |
| GET | `/api/movies/{id}/video` | 电影关联视频信息 |
| GET | `/api/movies/genres` | 类型列表 |
| GET | `/api/search/suggestions?q=` | 智能搜索联想 |
| GET | `/api/videos/{id}` | 视频详情 (VIP 鉴权) |
| GET | `/api/posters/{movieId}` | 电影海报图片 |
| GET | `/api/comments?movieId=X` | 评论列表 |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录（返回 JWT） |
| POST | `/api/ai/chat` | AI 对话（SSE 流式） |
| POST | `/api/ai/poster/recognize` | 海报识图找片 |

### 需认证

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/watchlist` | 获取片单（返回完整 Movie[]） |
| POST | `/api/watchlist` | 添加到片单 |
| DELETE | `/api/watchlist/{movieId}` | 从片单移除 |
| POST | `/api/comments` | 发表评论 |

### 管理员

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/stats` | 仪表盘统计 |
| GET | `/api/admin/videos` | 视频管理列表 |
| POST | `/api/admin/videos` | 上传视频 |
| DELETE | `/api/admin/videos/{id}` | 删除视频 |
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
- VIP 等级视频锁屏控制

---

## ✨ 主要功能特性

### 智能搜索 (v1.2.0)
- 700ms 防抖联想，全字段匹配（标题/导演/类型/年份）
- 搜索历史最多 20 条，大小写不敏感去重，支持单条删除/全部清空
- 关键词高亮 + 匹配类型标签，点击联想直接跳详情页
- 无结果时展示热门电影推荐

### 视频播放 (v1.2.0)
- HTML5 自定义播放器，YouTube 风格控制栏
- 播放进度 localStorage 记忆，刷新/重开恢复
- VIP 等级权限锁屏（USER/VIP/VVIP/SVIP 四档）
- 6 部电影关联真实预告片，其余 94 部共用演示视频

### 收藏功能 (v1.2.0 修复)
- 乐观更新即时反馈，跨页面自动同步
- 后端 BusinessException 按业务码映射正确 HTTP 状态

### AI 能力
- DeepSeek 对话 + Markdown 渲染 + thinking 动画
- DashScope qwen-vl-max 海报识图找片

---

## 📝 开发说明

### 前端独立预览

前端内置 Next.js API Routes 层，含完整 mock 数据。不启动后端也可预览：

```bash
cd frontend
npm install && npm run dev
# http://localhost:3000（使用内存模拟数据）
```

要连接真实后端，修改 `frontend/.env.local`：
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 数据库迁移 (v1.2.0)

视频功能需要在 `movie` 表追加三列：

```sql
ALTER TABLE movie
  ADD COLUMN has_video BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN video_url VARCHAR(500) DEFAULT NULL,
  ADD COLUMN required_vip_level VARCHAR(20) NOT NULL DEFAULT 'USER';
```

首次启动时 schema.sql 已包含此迁移。若已有数据库，手动执行上述 SQL。

---

## 📦 相关文档

| 文档 | 说明 |
|------|------|
| `项目结构文档.md` | 完整项目结构 v1.2.0 |
| `docs/界面设计.md` | YouTube 风格 UI 设计规范 v3.0 |
| `docs/应用架构文档.md` | 全栈架构设计 v1.0 |
| `功能设计文档/搜索功能完善设计文档.md` | 智能搜索详细设计 |
| `功能设计文档/播放功能文档.md` | 视频播放功能设计 v1.2.0 |
| `backend/src/main/resources/db/schema.sql` | 数据库完整 DDL |

---

> 📅 最后更新：2026-07-06
> 🎯 基于暑假实习「电影APP全栈开发 + AI智能体」课程大纲
> 🔗 GitHub: https://github.com/Mr-Sethakk/video-platforms
