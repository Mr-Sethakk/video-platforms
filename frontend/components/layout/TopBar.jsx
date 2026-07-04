'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Mic, Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TopBar({ onToggleSidebar, isSidebarOpen }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        setSearchExpanded(false);
      }
    },
    [searchQuery, router]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setSearchExpanded(false);
        setSearchQuery('');
      }
    },
    []
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0F0F0F] z-50 border-b border-[rgba(255,255,255,0.08)]">
      <div className="grid grid-cols-[auto_1fr_auto] items-center h-full px-4 gap-4">
        {/* ---- LEFT: Hamburger + Logo ---- */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-full hover:bg-[#272727] flex items-center justify-center transition-colors"
            aria-label={isSidebarOpen ? '收起侧边栏' : '展开侧边栏'}
          >
            <Menu size={24} strokeWidth={1.5} className="text-white" />
          </button>
          <Link
            href="/"
            title="返回首页"
            className="text-xl font-bold text-white flex items-center gap-2 select-none whitespace-nowrap px-3 py-1 rounded-lg border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)] hover:bg-[#272727] transition-all duration-200"
          >
            <span>🎬 电影APP</span>
          </Link>
        </div>

        {/* ---- CENTER: Search (desktop full, mobile collapsible) ---- */}
        {/* Desktop search — always visible */}
        <form
          onSubmit={handleSearch}
          className={`hidden sm:flex mx-auto items-center transition-all duration-1000 ease-in-out ${
            searchFocused ? 'w-[560px]' : 'w-[400px]'
          } max-w-[calc(100vw-280px)] min-w-0`}
        >
          <div className="relative flex-1 min-w-0">
            <Search
              size={18}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none z-10"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="搜索电影..."
              className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 pl-10 text-white placeholder:text-[#888] text-sm transition-all duration-1000 ease-in-out"
            />
          </div>
          <button
            type="button"
            className={`w-10 h-10 rounded-full bg-[#272727] hover:bg-[#3F3F3F] ml-2 flex items-center justify-center shrink-0 transition-all duration-1000 ease-in-out ${
              searchFocused ? 'rotate-[360deg]' : 'rotate-0'
            }`}
            aria-label="语音搜索"
          >
            <Mic size={20} strokeWidth={1.5} className="text-white" />
          </button>
        </form>

        {/* Mobile search trigger / collapse overlay */}
        <div className="flex sm:hidden flex-1 justify-end">
          {!searchExpanded ? (
            <button
              onClick={() => setSearchExpanded(true)}
              className="w-10 h-10 rounded-full hover:bg-[#272727] flex items-center justify-center transition-colors"
              aria-label="搜索"
            >
              <Search size={24} strokeWidth={1.5} className="text-white" />
            </button>
          ) : (
            <form
              onSubmit={handleSearch}
              className="fixed inset-0 z-[60] bg-[#0F0F0F] flex items-center px-4 gap-3"
            >
              <div className="relative flex-1 max-w-[640px] mx-auto">
                <Search
                  size={18}
                  strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none"
                />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="搜索电影..."
                  className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 pl-10 text-white placeholder:text-[#888] text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchExpanded(false);
                  setSearchQuery('');
                }}
                className="text-[#AAAAAA] text-sm hover:text-white transition-colors shrink-0"
              >
                取消
              </button>
            </form>
          )}
        </div>

        {/* ---- RIGHT: Notifications + User ---- */}
        <div className="flex items-center gap-1">
          {/* Notification bell */}
          <button
            className="relative w-10 h-10 rounded-full hover:bg-[#272727] flex items-center justify-center transition-colors"
            aria-label="通知"
          >
            <Bell size={24} strokeWidth={1.5} className="text-white" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0F0F0F]" />
          </button>

          {/* User avatar / login link */}
          {isAuthenticated && user ? (
            <Link href="/profile" className="w-10 h-10 rounded-full hover:bg-[#272727] flex items-center justify-center transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                <User size={18} strokeWidth={1.5} className="text-white" />
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center px-4 h-8 rounded-full border border-[#6366F1] text-[#6366F1] text-sm font-medium hover:bg-[#6366F1] hover:text-white transition-colors"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
