'use client'

import { useState, useCallback } from 'react'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import CategoryChips from '@/components/layout/CategoryChips'
import MovieGrid from '@/components/movie/MovieGrid'
import { useInfiniteMovies } from '@/hooks/useInfiniteMovies'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { GENRES } from '@/lib/constants'

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeGenre, setActiveGenre] = useState('')
  const [activeSort] = useState('default')

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

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const handleGenreChange = useCallback((genre) => {
    setActiveGenre(genre)
  }, [])

  const genreItems = GENRES.map((g) => ({ label: g, value: g }))

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
          <CategoryChips
            items={genreItems}
            active={activeGenre}
            onChange={handleGenreChange}
          />

          <div className="mt-2">
            <MovieGrid
              movies={movies}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onAddToWatchlist={addToWatchlist}
              onRemoveFromWatchlist={removeFromWatchlist}
              isInWatchlist={isInWatchlist}
            />
          </div>

          {error && (
            <div className="px-6 py-4 text-center">
              <p className="text-red-400 text-sm">
                加载失败: {error}
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
