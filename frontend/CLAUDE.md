# 影视平台前端

## 技术栈
- Next.js 14 (App Router), React 18, TailwindCSS 3.4
- Lucide Icons (size=24, strokeWidth=1.5)
- 进口路径统一用 `@/` 前缀

## 设计规范
详见 `../docs/界面设计.md`

### 核心约定
- **100% TailwindCSS**，不创建自定义 CSS 文件
- **全站暗色** bg-[#0F0F0F]，不做浅色切换
- 卡片 Hover：**无缩放**，仅 brightness-75
- 组件类型：纯展示用 Server Component，有交互/useState 的用 'use client'
- 响应式断点：sm(640) md(1024) lg(1280) xl(1536) 2xl(1536+)
- 所有数据组件：有 Skeleton 加载态 + Empty 空状态
- 图片：豆瓣 CDN 海报必须加 `referrerPolicy="no-referrer"`

### 颜色常量
- bg-primary: #0F0F0F, bg-secondary: #212121, bg-tertiary: #303030
- text-primary: #FFFFFF, text-secondary: #AAAAAA
- brand-primary: #6366F1, rating-star: #F59E0B

## API
- 封装在 `lib/api.js` 的 `apiFetch(url, options)`
- 后端地址通过 `.env.local` 的 `NEXT_PUBLIC_API_BASE_URL` 配置
- 当前指向 `http://localhost:8080/api`

## 目录结构
- `app/` — 页面 (App Router)
- `components/` — UI组件 (layout/movie/chat/auth/admin/ui/upload)
- `hooks/` — useAuth, useInfiniteMovies, useWatchlist, useChat, useDebounce
- `lib/` — api.js, constants.js

## 端口
- 开发服务器: http://localhost:3000
