'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import SortBar from '@/components/movie/SortBar'
import MovieGrid from '@/components/movie/MovieGrid'
import { useInfiniteMovies } from '@/hooks/useInfiniteMovies'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { GENRES } from '@/lib/constants'

function MoviesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeGenre = searchParams.get('genre') || ''
  const activeSort = searchParams.get('sort') || 'default'

  const { isAdmin } = useAuth()
  const {
    count: watchlistCount,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  } = useWatchlist()

  const { movies, loading, hasMore, error, loadMore } = useInfiniteMovies({
    genre: activeGenre || undefined,
    sort: activeSort,
  })

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const handleSortChange = useCallback(
    (sort) => {
      const params = new URLSearchParams(searchParams.toString())
      if (sort) {
        params.set('sort', sort)
      } else {
        params.delete('sort')
      }
      router.push(`/movies?${params.toString()}`)
    },
    [searchParams, router]
  )

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
          <SortBar
            currentSort={activeSort}
            onSortChange={handleSortChange}
            title={activeGenre ? `${activeGenre}电影` : '电影列表'}
          />

          <MovieGrid
            movies={movies}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist}
          />

          {error && (
            <div className="px-6 py-4 text-center">
              <p className="text-red-400 text-sm">加载失败: {error}</p>
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

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F0F] pt-14 flex items-center justify-center">
          <p className="text-[#AAAAAA] text-sm">加载中...</p>
        </div>
      }
    >
      <MoviesContent />
    </Suspense>
  )
}
