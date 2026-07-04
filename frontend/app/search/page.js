'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import MovieGrid from '@/components/movie/MovieGrid'
import { useInfiniteMovies } from '@/hooks/useInfiniteMovies'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { GENRES } from '@/lib/constants'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(query)

  const { isAdmin } = useAuth()
  const {
    count: watchlistCount,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  } = useWatchlist()

  const { movies, loading, hasMore, error, loadMore } = useInfiniteMovies({
    search: query || undefined,
  })

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const trimmed = searchInput.trim()
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      }
    },
    [searchInput, router]
  )

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="flex pt-14">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          genres={GENRES}
          watchlistCount={watchlistCount}
          isAdmin={isAdmin}
        />

        <main
          className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${
            sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'
          }`}
        >
          {/* Search header */}
          <div className="px-6 py-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span>🔍</span>
              </h1>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索电影..."
                className="flex-1 bg-transparent border-b border-[#303030] focus:border-[#6366F1] focus:outline-none py-1 text-white text-lg placeholder:text-[#717171]"
              />
            </form>
            {query && (
              <p className="text-sm text-[#AAAAAA] mt-1">
                找到 {movies.length} 部电影
              </p>
            )}
          </div>

          {query ? (
            <MovieGrid
              movies={movies}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              emptyMessage="没有找到匹配的电影"
              onAddToWatchlist={addToWatchlist}
              onRemoveFromWatchlist={removeFromWatchlist}
              isInWatchlist={isInWatchlist}
            />
          ) : (
            <div className="px-6 py-20 text-center">
              <p className="text-[#AAAAAA] text-sm">请输入搜索关键词</p>
            </div>
          )}

          {error && (
            <div className="px-6 py-4 text-center">
              <p className="text-red-400 text-sm">搜索失败: {error}</p>
              <button
                onClick={loadMore}
                className="mt-2 text-sm text-[#6366F1] hover:underline"
              >
                重试
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F0F] pt-14 flex items-center justify-center">
          <p className="text-[#AAAAAA] text-sm">搜索中...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
