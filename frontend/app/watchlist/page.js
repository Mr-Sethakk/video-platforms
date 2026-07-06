'use client'

import { useState, useCallback } from 'react'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import MovieCard from '@/components/movie/MovieCard'
import Empty from '@/components/ui/Empty'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { Heart } from 'lucide-react'

export default function WatchlistPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { isAuthenticated, isAdmin } = useAuth()
  const {
    items,
    loading,
    count,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  } = useWatchlist()

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const handleRemove = useCallback(
    async (movieId) => {
      // 即时调用 API，乐观更新由 removeFromWatchlist 内部处理
      await removeFromWatchlist(movieId)
    },
    [removeFromWatchlist]
  )

  // ========== Not authenticated ==========
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="flex pt-14">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            watchlistCount={0}
            isAdmin={isAdmin}
          />
          <main
            className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${
              sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'
            }`}
          >
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
              <Empty
                title="请先登录"
                description="登录后即可查看和管理你的收藏片单"
                action={{
                  label: '前往登录',
                  onClick: () => {
                    window.location.href = '/login'
                  },
                }}
              />
            </div>
          </main>
        </div>
      </div>
    )
  }

  // ========== Main render ==========
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="flex pt-14">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          watchlistCount={count}
          isAdmin={isAdmin}
        />

        <main
          className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${
            sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'
          }`}
        >
          {/* Header */}
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>❤️</span>
              <span>我的片单</span>
              <span className="text-base font-normal text-[#AAAAAA]">
                · {count}部
              </span>
            </h1>
          </div>

          {/* Content */}
          {loading && items.length === 0 ? (
            <div className="px-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 gap-y-10">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden">
                    <div className="aspect-[2/3] bg-[#272727] animate-pulse rounded-xl" />
                    <div className="h-4 w-3/4 bg-[#272727] animate-pulse rounded mt-2" />
                    <div className="h-3 w-1/2 bg-[#272727] animate-pulse rounded mt-1" />
                  </div>
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-20">
              <Empty
                icon={<Heart size={48} strokeWidth={1.5} className="text-[#AAAAAA]" />}
                title="收藏列表还是空的"
                description="快去发现喜欢的电影吧！"
                action={{
                  label: '🎬 浏览电影',
                  onClick: () => {
                    window.location.href = '/'
                  },
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 gap-y-10 px-6">
              {items.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  variant="grid"
                  onAddToWatchlist={addToWatchlist}
                  onRemoveFromWatchlist={handleRemove}
                  isInWatchlist={isInWatchlist(movie.id)}
                />
              ))}
            </div>
          )}

          {/* Loading more indicator */}
          {loading && items.length > 0 && (
            <div className="px-6 py-4 text-center">
              <p className="text-[#AAAAAA] text-sm">加载中...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
