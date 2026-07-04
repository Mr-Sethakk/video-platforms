'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Film, Sparkles, Shield, Globe, ArrowRight } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { GENRES } from '@/lib/constants';

const TECH_STACK = [
  { category: '前端', items: ['Next.js 14 (App Router)', 'React 18', 'TailwindCSS 3.4', 'Lucide Icons', 'Recharts'] },
  { category: '后端', items: ['Spring Boot 3.2', 'Spring Security + JWT', 'Spring Data JPA', 'MySQL 8.0', 'Redis 7'] },
  { category: 'AI / 基础设施', items: ['Docker Compose', '通义千问 (可插拔)', '豆瓣数据爬取', 'SSE 流式响应'] },
];

const FEATURES = [
  { icon: <Film size={28} />, title: '电影浏览', desc: '豆瓣 Top 100 高分电影，14 种分类筛选，无限滚动加载' },
  { icon: <Sparkles size={28} />, title: 'AI 智能推荐', desc: '右下角悬浮助手，自然语言对话推荐，SSE 流式响应' },
  { icon: <Shield size={28} />, title: '用户系统', desc: 'JWT 无状态认证，BCrypt 加密，角色权限控制 (USER/ADMIN)' },
  { icon: <Globe size={28} />, title: '全平台适配', desc: '响应式设计，手机 / 平板 / 桌面 五档断点完美适配' },
];

export default function AboutPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin } = useAuth();
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} genres={GENRES} isAdmin={isAdmin} />

        <main className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'}`}>
          {/* Hero banner */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#6366F1]/10 via-transparent to-[#0F0F0F]" />
            <div className="relative max-w-[900px] mx-auto px-6 py-16 text-center">
              <div className="inline-flex items-center gap-2 text-4xl mb-4">
                <span>🎬</span>
                <span className="text-white font-bold">电影APP</span>
              </div>
              <p className="text-lg text-[#AAAAAA] mb-2">YouTube 风格 · 豆瓣数据 · AI 驱动</p>
              <p className="text-sm text-[#717171] max-w-[600px] mx-auto">
                一个面向 C 端用户的影视内容平台，支持电影浏览/搜索/收藏、
                AI 智能客服对话、内容审核上架等完整业务闭环。
              </p>
            </div>
          </div>

          <div className="max-w-[900px] mx-auto px-6 pb-16">
            {/* ===== Features ===== */}
            <h2 className="text-xl font-bold text-white mb-6">✨ 核心功能</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 flex gap-4 hover:border-[rgba(255,255,255,0.12)] transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center shrink-0 text-[#6366F1]">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{f.title}</h3>
                    <p className="text-sm text-[#AAAAAA] mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== Tech stack ===== */}
            <h2 className="text-xl font-bold text-white mb-6">🛠️ 技术栈</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {TECH_STACK.map((group, i) => (
                <div
                  key={i}
                  className="bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5"
                >
                  <h3 className="text-[#6366F1] text-sm font-semibold mb-3 uppercase tracking-wider">
                    {group.category}
                  </h3>
                  <ul className="space-y-2">
                    {group.items.map((item, j) => (
                      <li key={j} className="text-sm text-[#AAAAAA] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]/60 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* ===== Quick links ===== */}
            <h2 className="text-xl font-bold text-white mb-6">🔗 相关链接</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { href: '/', label: '返回首页', desc: '开始浏览电影' },
                { href: '/help', label: '使用帮助', desc: '常见问题与解答' },
                { href: 'https://github.com/Mr-Sethakk/video-platforms', label: 'GitHub 仓库', desc: '查看源代码', external: true },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  className="bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 group hover:border-[#6366F1]/30 transition-colors flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-white font-medium text-sm">{link.label}</h3>
                    <p className="text-xs text-[#717171] mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowRight size={18} strokeWidth={1.5} className="text-[#717171] group-hover:text-[#6366F1] group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)] text-center">
              <p className="text-sm text-[#717171]">
                🎬 电影APP · 基于豆瓣 Top 250 数据 · 仅供学习交流
              </p>
              <p className="text-xs text-[#555] mt-1">© 2026 Movie Platform. All data from douban.com</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
