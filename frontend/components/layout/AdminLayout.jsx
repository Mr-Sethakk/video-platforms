'use client';

import { useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import Empty from '@/components/ui/Empty';
import { useAuth } from '@/hooks/useAuth';
import { useWatchlist } from '@/hooks/useWatchlist';

/**
 * 管理后台共享布局
 * 所有 /admin/* 页面套用此组件，消除重复的 TopBar+Sidebar+权限校验 样板代码
 */
export default function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, isAuthenticated } = useAuth();
  const { count: watchlistCount } = useWatchlist();

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="flex pt-14">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} watchlistCount={watchlistCount} isAdmin={isAdmin} />
          <main className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'}`}>
            <div className="flex items-center justify-center min-h-[400px]">
              <Empty title="无权限访问" description="此页面仅限管理员访问" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} watchlistCount={watchlistCount} isAdmin={isAdmin} />
        <main className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'}`}>
          <div className="p-6">
            {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
