'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Camera, Bell, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useToast } from '@/components/ui/Toast';
import SearchDropdown from '@/components/search/SearchDropdown';
import PosterSearchModal from '@/components/upload/PosterSearchModal';
import { apiFetch } from '@/lib/api';
import { SEARCH } from '@/lib/constants';

export default function TopBar({ onToggleSidebar, isSidebarOpen }) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const { history, addHistory, deleteHistory, clearHistory } = useSearchHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const searchFormRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // 700ms 防抖
  const debouncedQuery = useDebounce(searchQuery, SEARCH.DEBOUNCE_MS);

  // 联想请求
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestionsLoading(true);

    apiFetch(`/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`)
      .then((data) => {
        if (!cancelled) {
          setSuggestions(data.suggestions || []);
          setSuggestionsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
          setSuggestionsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // 清理 blur timeout
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  // ========== Handlers ==========

  const handleSearchSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const trimmed = searchQuery.trim();

      // 空关键词：不发起搜索
      if (!trimmed) return;

      // 超长截断
      if (trimmed.length > SEARCH.MAX_KEYWORD_LENGTH) {
        addToast(`关键词过长，已自动截断为前${SEARCH.MAX_KEYWORD_LENGTH}个字符`, 'info');
      }
      const finalKeyword = trimmed.slice(0, SEARCH.MAX_KEYWORD_LENGTH);

      // 保存搜索历史
      addHistory(finalKeyword);

      // 关闭下拉
      setDropdownOpen(false);
      setSearchExpanded(false);

      router.push(`/search?q=${encodeURIComponent(finalKeyword)}`);
    },
    [searchQuery, router, addHistory, addToast]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setSearchExpanded(false);
        setSearchQuery('');
      }
    },
    []
  );

  const handleFocus = useCallback(() => {
    setSearchFocused(true);
    setDropdownOpen(true);
    clearBlurTimeout();
  }, []);

  const handleBlur = useCallback(() => {
    setSearchFocused(false);
    // 延迟关闭，让 onMouseDown 有机会触发
    blurTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  }, []);

  const clearBlurTimeout = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  // 清空输入
  const handleClearInput = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
  }, []);

  // 点击联想建议 → 跳转详情页
  const handleSelectSuggestion = useCallback(
    (movie) => {
      addHistory(searchQuery.trim().slice(0, SEARCH.MAX_KEYWORD_LENGTH));
      setDropdownOpen(false);
      router.push(`/movies/${movie.id}`);
    },
    [searchQuery, router, addHistory]
  );

  // 点击历史记录 → 填入搜索框并执行搜索
  const handleSelectHistory = useCallback(
    (keyword) => {
      setSearchQuery(keyword);
      setDropdownOpen(false);
      router.push(`/search?q=${encodeURIComponent(keyword)}`);
    },
    [router]
  );

  const handleDeleteHistory = useCallback(
    (keyword) => {
      deleteHistory(keyword);
    },
    [deleteHistory]
  );

  // ========== Render ==========
  return (
    <>
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

        {/* ---- CENTER: Search (desktop) ---- */}
        <form
          ref={searchFormRef}
          onSubmit={handleSearchSubmit}
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
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="搜索电影、导演、演员..."
              className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 pl-10 pr-10 text-white placeholder:text-[#888] text-sm transition-all duration-1000 ease-in-out"
            />
            {/* 清空按钮 — 输入内容后出现 */}
            {searchQuery && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClearInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-white transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            )}

            {/* ===== 搜索下拉面板 ===== */}
            <SearchDropdown
              isOpen={dropdownOpen}
              history={history}
              suggestions={suggestions}
              loading={suggestionsLoading}
              searchQuery={searchQuery}
              onSelectSuggestion={handleSelectSuggestion}
              onSelectHistory={handleSelectHistory}
              onDeleteHistory={handleDeleteHistory}
              onClearHistory={clearHistory}
              onClose={() => setDropdownOpen(false)}
            />
          </div>

          <button
            type="button"
            onClick={() => setPosterModalOpen(true)}
            className="w-10 h-10 rounded-full bg-[#272727] hover:bg-[#3F3F3F] ml-2 flex items-center justify-center shrink-0 transition-all duration-200 group"
            aria-label="海报识图找片"
            title="识图找片"
          >
            <Camera size={20} strokeWidth={1.5} className="text-white group-hover:text-[#6366F1] transition-colors" />
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
              onSubmit={handleSearchSubmit}
              className="fixed inset-0 z-[60] bg-[#0F0F0F] flex flex-col pt-2"
            >
              <div className="flex items-center px-4 gap-3">
                <div className="relative flex-1 max-w-[640px]">
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
                    placeholder="搜索电影、导演、演员..."
                    className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 pl-10 pr-10 text-white placeholder:text-[#888] text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleClearInput}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-white transition-colors"
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchExpanded(false);
                    setSearchQuery('');
                    setDropdownOpen(false);
                  }}
                  className="text-[#AAAAAA] text-sm hover:text-white transition-colors shrink-0"
                >
                  取消
                </button>
              </div>

              {/* Mobile dropdown — full width below input */}
              {searchQuery && (
                <div className="px-4 mt-3 relative">
                  <SearchDropdown
                    isOpen={true}
                    history={history}
                    suggestions={suggestions}
                    loading={suggestionsLoading}
                    searchQuery={searchQuery}
                    onSelectSuggestion={handleSelectSuggestion}
                    onSelectHistory={handleSelectHistory}
                    onDeleteHistory={handleDeleteHistory}
                    onClearHistory={clearHistory}
                    onClose={() => {}}
                  />
                </div>
              )}

              {/* Mobile: show history when no query */}
              {!searchQuery && history.length > 0 && (
                <div className="px-4 mt-3 relative">
                  <SearchDropdown
                    isOpen={true}
                    history={history}
                    suggestions={[]}
                    loading={false}
                    searchQuery=""
                    onSelectHistory={handleSelectHistory}
                    onDeleteHistory={handleDeleteHistory}
                    onClearHistory={clearHistory}
                  />
                </div>
              )}
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
              <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center">
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
    <PosterSearchModal
      isOpen={posterModalOpen}
      onClose={() => setPosterModalOpen(false)}
    />
  </>
  );
}
