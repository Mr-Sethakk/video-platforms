'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Clock, LogOut, Edit3, Save, X } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { GENRES } from '@/lib/constants';

export default function ProfilePage() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setForm({ username: user.username || '', email: user.email || '' });
    }
  }, [isAuthenticated, user, router]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    // Simulate save — in production would call API
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setEditing(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

            <h1 className="text-2xl font-bold mt-4 mb-8">个人中心</h1>

            {/* ===== Avatar + basic info card ===== */}
            <div className="bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 mb-6">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-[#6366F1] flex items-center justify-center shrink-0">
                  <User size={36} strokeWidth={1.5} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="space-y-3">
                      <input
                        value={form.username}
                        onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                        className="w-full h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm"
                        placeholder="用户名"
                      />
                      <input
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm"
                        placeholder="邮箱"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-white">{user.username}</h2>
                      <p className="text-sm text-[#AAAAAA] mt-1 flex items-center gap-1">
                        <Mail size={14} strokeWidth={1.5} /> {user.email || '未设置邮箱'}
                      </p>
                      <p className="text-xs text-[#717171] mt-2">
                        注册时间：{user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '—'}
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={editing ? handleSave : () => setEditing(true)}
                  disabled={saving}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    editing
                      ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                      : 'bg-[#303030] text-white hover:bg-[#3F3F3F]'
                  }`}
                >
                  {editing ? (
                    saving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={16} strokeWidth={1.5} /> 保存
                      </>
                    )
                  ) : (
                    <>
                      <Edit3 size={16} strokeWidth={1.5} /> 编辑
                    </>
                  )}
                </button>
                {editing && (
                  <button
                    onClick={() => { setEditing(false); setForm({ username: user.username, email: user.email }); }}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[#303030] text-white hover:bg-[#3F3F3F] transition-colors"
                  >
                    <X size={16} strokeWidth={1.5} /> 取消
                  </button>
                )}
              </div>
            </div>

            {/* ===== Info grid ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center shrink-0">
                  <Shield size={20} strokeWidth={1.5} className="text-[#6366F1]" />
                </div>
                <div>
                  <p className="text-sm text-[#AAAAAA]">账号角色</p>
                  <p className="text-white font-medium mt-0.5">
                    {user.role === 'ADMIN' ? '👑 管理员' : '👤 普通用户'}
                  </p>
                  <p className="text-xs text-[#717171] mt-1">
                    {user.role === 'ADMIN' ? '拥有管理后台、视频审核等全部权限' : '可浏览电影、收藏片单、AI聊天'}
                  </p>
                </div>
              </div>

              <div className="bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center shrink-0">
                  <Clock size={20} strokeWidth={1.5} className="text-[#10B981]" />
                </div>
                <div>
                  <p className="text-sm text-[#AAAAAA]">上次登录</p>
                  <p className="text-white font-medium mt-0.5">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleString('zh-CN') : '—'}
                  </p>
                  <p className="text-xs text-[#717171] mt-1">登录状态：{isAuthenticated ? '🟢 在线' : '🔴 离线'}</p>
                </div>
              </div>
            </div>

            {/* ===== Quick links ===== */}
            <div className="bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 mb-6">
              <h3 className="text-sm font-medium text-[#AAAAAA] mb-3">快捷入口</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { href: '/watchlist', label: '📋 我的片单' },
                  { href: '/movies', label: '🎬 浏览电影' },
                  { href: '/movies?sort=rating', label: '⭐ 高分排行' },
                  { href: '/movies?sort=year', label: '🆕 最新上映' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#0F0F0F] hover:bg-[#272727] text-white text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ===== Logout ===== */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm font-medium hover:bg-[#EF4444]/20 transition-colors"
            >
              <LogOut size={18} strokeWidth={1.5} />
              退出登录
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
