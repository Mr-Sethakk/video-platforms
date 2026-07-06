'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import MovieGrid from '@/components/movie/MovieGrid'
import MovieCard from '@/components/movie/MovieCard'
import Skeleton from '@/components/ui/Skeleton'
import { useInfiniteMovies } from '@/hooks/useInfiniteMovies'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { apiFetch } from '@/lib/api'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(query)
  const [popularMovies, setPopularMovies] = useState([])
  const [popularLoading, setPopularLoading] = useState(false)

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

  // 搜索结果为空时，加载热门电影推荐
  useEffect(() => {
    if (query && !loading && movies.length === 0 && !error) {
      setPopularLoading(true)
      apiFetch('/movies?pageSize=8&sort=rating')
        .then((data) => setPopularMovies(data.records || []))
        .catch(() => setPopularMovies([]))
        .finally(() => setPopularLoading(false))
    } else {
      setPopularMovies([])
    }
  }, [query, loading, movies.length, error])

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

  const isEmpty = query && !loading && movies.length === 0 && !error

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="flex pt-14">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          watchlistCount={watchlistCount}
          isAdmin={isAdmin}
        />

        <main
          className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${
            sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'
          }`}
        >
          {/* ===== Search header ===== */}
          <div className="px-6 py-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <h1 className="text-xl font-bold flex items-center gap-2 shrink-0">
                <span>🔍</span>
              </h1>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索电影、导演、演员..."
                className="flex-1 bg-transparent border-b border-[#303030] focus:border-[#6366F1] focus:outline-none py-1 text-white text-lg placeholder:text-[#717171]"
              />
            </form>

            {/* 搜索结果计数 */}
            {query && !loading && !error && movies.length > 0 && (
              <p className="text-sm text-[#AAAAAA] mt-2">
                找到 <span className="text-white font-medium">{movies.length}</span> 部相关影片
              </p>
            )}

            {/* 搜索加载中 */}
            {loading && (
              <div className="mt-2">
                <Skeleton variant="text" />
              </div>
            )}
          </div>

          {/* ===== 有结果：展示网格 ===== */}
          {query && movies.length > 0 && (
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
          )}

          {/* ===== 加载骨架屏 ===== */}
          {loading && movies.length === 0 && (
            <div className="px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-10">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} variant="card" />
                ))}
              </div>
            </div>
          )}

          {/* ===== 无结果 ===== */}
          {isEmpty && (
            <div className="px-6">
              {/* 无结果提示 */}
              <div className="py-12 text-center">
                <div className="text-5xl mb-4">🎬</div>
                <p className="text-white text-base font-medium mb-1">
                  未找到与 &quot;{query}&quot; 相关的电影
                </p>
                <p className="text-[#AAAAAA] text-sm mb-6">
                  试试换个关键词吧
                </p>
              </div>

              {/* 热门电影推荐 */}
              <div className="pb-12">
                <h2 className="text-base font-medium text-white mb-4 flex items-center gap-2">
                  <span>🔥</span> 热门电影推荐
                </h2>
                {popularLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-10">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} variant="grid" />
                    ))}
                  </div>
                ) : popularMovies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-10">
                    {popularMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        variant="grid"
                        onAddToWatchlist={addToWatchlist}
                        onRemoveFromWatchlist={removeFromWatchlist}
                        isInWatchlist={isInWatchlist?.(movie.id)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* ===== 未输入关键词 ===== */}
          {!query && (
            <div className="px-6 py-20 text-center">
              <p className="text-[#AAAAAA] text-sm">请输入搜索关键词</p>
            </div>
          )}

          {/* ===== 错误状态 ===== */}
          {error && (
            <div className="px-6 py-4 text-center">
              <p className="text-red-400 text-sm">
                搜索失败: {error}
              </p>
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
