'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Heart, MessageCircle, Upload, Star, Shield } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { GENRES } from '@/lib/constants';

const FAQS = [
  {
    icon: <Search size={22} strokeWidth={1.5} />,
    question: '如何搜索电影？',
    answer: '在顶部搜索框输入电影名称、导演或关键词，按回车即可搜索。你也可以通过左侧边栏或首页顶部的分类标签快速筛选特定类型的电影。搜索支持中文，输入"肖申克"即可找到《肖申克的救赎》。',
  },
  {
    icon: <Heart size={22} strokeWidth={1.5} />,
    question: '如何收藏电影？',
    answer: '在任意电影卡片上，点击左上角的 ❤️ 心形图标即可将电影加入你的片单。再次点击即可取消收藏。收藏后可在"我的片单"页面查看所有已收藏电影。注意：收藏功能需要先登录账号。',
  },
  {
    icon: <MessageCircle size={22} strokeWidth={1.5} />,
    question: '如何使用 AI 电影助手？',
    answer: '点击页面右下角的紫色 💬 按钮即可打开 AI 聊天面板。你可以用自然语言提问，例如："推荐一部科幻电影"、"介绍《肖申克的救赎》"、"有什么高分动画片？"。AI 助手会根据你的需求智能推荐电影。',
  },
  {
    icon: <Star size={22} strokeWidth={1.5} />,
    question: '电影评分来源是哪里？',
    answer: '本平台的所有电影数据（评分、简介、导演、海报等）均来自豆瓣电影 Top 250 榜单，数据通过自动化爬取获取并存储在自有数据库中，仅供学习交流使用。',
  },
  {
    icon: <Upload size={22} strokeWidth={1.5} />,
    question: '如何上传视频？',
    answer: '登录后，通过侧边栏的"上传视频"入口进入上传页面。支持常见的视频格式，上传后需要经过管理员审核才能公开显示。上传功能需要创作者或更高级别权限。',
  },
  {
    icon: <Shield size={22} strokeWidth={1.5} />,
    question: '忘记密码怎么办？',
    answer: '当前版本暂不支持自助找回密码。如需重置密码，请联系管理员（admin@movie.com）。我们会在后续版本中加入邮箱验证找回功能。',
  },
  {
    question: '支持哪些设备？',
    answer: '本平台采用响应式设计，完美适配手机（<640px）、平板（640-1024px）、笔记本电脑（1024-1280px）、桌面显示器（1280-1536px）和超大屏幕（>1536px）五种屏幕尺寸。在手机上访问时，侧边栏会变为抽屉式滑出，搜索框会折叠为图标。',
  },
  {
    question: '如何成为管理员？',
    answer: '管理员账号由系统预设。普通用户如需管理员权限，请联系现有管理员进行角色变更。演示环境可使用 admin/admin123 登录体验管理后台功能。',
  },
  {
    question: '数据会定期更新吗？',
    answer: '当前电影数据为一次性导入的豆瓣 Top 100。后续版本将支持定时任务自动更新电影榜单数据，保持与豆瓣评分的同步。',
  },
];

function FaqItem({ faq, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden transition-colors hover:border-[rgba(255,255,255,0.10)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        {faq.icon && (
          <span className="text-[#6366F1] shrink-0">{faq.icon}</span>
        )}
        <span className="flex-1 text-white text-sm font-medium">{faq.question}</span>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={`text-[#717171] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`px-5 overflow-hidden transition-all duration-200 ${
          open ? 'pb-5 max-h-[500px]' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-[#AAAAAA] leading-relaxed pl-[52px]">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin } = useAuth();
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} genres={GENRES} isAdmin={isAdmin} />

        <main className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'}`}>
          <div className="max-w-[800px] mx-auto px-6 py-8">
            {/* Back link */}
            <Link href="/" className="text-sm text-[#AAAAAA] hover:text-white transition-colors">
              ← 返回首页
            </Link>

            {/* Header */}
            <div className="mt-4 mb-8">
              <h1 className="text-2xl font-bold text-white">帮助中心</h1>
              <p className="text-sm text-[#AAAAAA] mt-2">常见问题与使用指南</p>
            </div>

            {/* Quick links */}
            <div className="bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 mb-8">
              <h3 className="text-sm font-medium text-[#AAAAAA] mb-3">快速导航</h3>
              <div className="flex flex-wrap gap-2">
                {['搜索', '收藏', 'AI', '评分', '上传', '密码', '设备', '管理员', '数据'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const el = document.querySelector(`[data-faq-tag="${tag}"]`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#0F0F0F] hover:bg-[#303030] text-sm text-[#AAAAAA] hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ list */}
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} data-faq-tag={['搜索','收藏','AI','评分','上传','密码','设备','管理员','数据'][i]}>
                  <FaqItem faq={faq} defaultOpen={i === 0} />
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-8 bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 text-center">
              <h3 className="text-white font-medium mb-2">还没有解决你的问题？</h3>
              <p className="text-sm text-[#AAAAAA] mb-4">
                试试点击右下角的 💬 AI 助手，或者直接联系我们
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/about"
                  className="px-5 py-2 rounded-full bg-[#303030] text-white text-sm hover:bg-[#3F3F3F] transition-colors"
                >
                  关于我们
                </Link>
                <a
                  href="https://github.com/Mr-Sethakk/video-platforms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full bg-[#6366F1] text-white text-sm hover:bg-[#4F46E5] transition-colors"
                >
                  GitHub 仓库
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
