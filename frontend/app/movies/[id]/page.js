'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import MovieCard from '@/components/movie/MovieCard'
import Skeleton from '@/components/ui/Skeleton'
import Empty from '@/components/ui/Empty'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { apiFetch } from '@/lib/api'

export default function MovieDetailPage() {
  const { id } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [recsLoading, setRecsLoading] = useState(false)

  const { isAdmin } = useAuth()
  const {
    count: watchlistCount,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  } = useWatchlist()

  const fetchMovie = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch(`/movies/${id}`)
      setMovie(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchRecommendations = useCallback(async () => {
    setRecsLoading(true)
    try {
      const data = await apiFetch('/movies?pageSize=10')
      setRecommendations(
        (data.records || []).filter((m) => String(m.id) !== String(id))
      )
    } catch {
      // Silently fail for recommendations
    } finally {
      setRecsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchMovie()
    fetchRecommendations()
  }, [fetchMovie, fetchRecommendations])

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const handleWatchlistToggle = useCallback(async () => {
    if (!movie) return
    if (isInWatchlist(movie.id)) {
      await removeFromWatchlist(movie.id)
    } else {
      await addToWatchlist(movie.id)
    }
  }, [movie, isInWatchlist, addToWatchlist, removeFromWatchlist])

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // Silently fail
    }
  }, [])

  // ========== Loading state ==========
  if (loading) {
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
            <div className="p-6 max-w-5xl">
              <Skeleton variant="detail" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  // ========== Error state ==========
  if (error) {
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
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
              <p className="text-red-400 text-sm mb-4">加载失败: {error}</p>
              <button
                onClick={fetchMovie}
                className="rounded-full bg-[#6366F1] px-6 py-2 text-sm text-white hover:bg-[#4F46E5] transition-colors"
              >
                重试
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const inWatchlist = movie ? isInWatchlist(movie.id) : false

  // ========== Recommendations ==========
  const recommendationsList = (
    <div className="space-y-2">
      {recommendations.map((rec) => (
        <MovieCard
          key={rec.id}
          movie={rec}
          variant="horizontal"
          onAddToWatchlist={addToWatchlist}
          onRemoveFromWatchlist={removeFromWatchlist}
          isInWatchlist={isInWatchlist(rec.id)}
        />
      ))}
    </div>
  )

  const recommendationsSkeleton = (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="horizontal" />
      ))}
    </div>
  )

  // ========== Main render ==========
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
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* ===== LEFT column ===== */}
              <div className="flex-1 min-w-0">
                {/* Back button */}
                <Link
                  href="/movies"
                  title="返回电影列表"
                  className="inline-flex items-center gap-1.5 text-sm text-[#AAAAAA] hover:text-white transition-all duration-200 mb-4 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)] hover:bg-[#272727]"
                >
                  <ArrowLeft size={16} strokeWidth={1.5} />
                  返回
                </Link>

                {/* Poster */}
                <div className="rounded-xl overflow-hidden bg-[#0F0F0F] max-h-[500px]">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full max-h-[500px] object-contain bg-[#0F0F0F]"
                    />
                  ) : (
                    <div className="w-full h-[300px] bg-gradient-to-br from-[#6366F1]/30 to-[#6366F1]/10 flex items-center justify-center">
                      <span className="text-[#AAAAAA] text-sm">暂无海报</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold mt-4">{movie.title}</h1>

                {/* Meta row */}
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#AAAAAA]">
                  <span>⭐ {movie.rating}</span>
                  <span>📅 {movie.year}</span>
                  <span>🎭 {movie.genre}</span>
                </div>

                {/* Extra meta */}
                <div className="text-sm text-[#AAAAAA] mt-1">
                  {movie.duration && (
                    <span>⏱ {movie.duration}分钟</span>
                  )}
                  {movie.country && (
                    <span>
                      {movie.duration ? ' · ' : ''}🌍 {movie.country}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleWatchlistToggle}
                    className={`rounded-full px-6 py-2 text-sm transition-colors ${
                      inWatchlist
                        ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                        : 'bg-[#303030] text-white hover:bg-[#3F3F3F]'
                    }`}
                  >
                    {inWatchlist ? '❤️ 已加入片单' : '❤️ 加入片单'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="rounded-full bg-[#303030] px-6 py-2 text-sm text-white hover:bg-[#3F3F3F] transition-colors"
                  >
                    🔗 分享
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-[#303030] my-4" />

                {/* Description */}
                <section>
                  <h2 className="text-base font-medium mb-2">简介</h2>
                  <p className="text-sm text-[#AAAAAA] leading-relaxed">
                    {movie.description || '暂无简介'}
                  </p>
                </section>

                {/* Divider */}
                <div className="border-t border-[#303030] my-4" />

                {/* Comments placeholder */}
                <section>
                  <h2 className="text-base font-medium mb-3">💬 评论</h2>
                  <Empty title="暂无评论" />
                </section>

                {/* Mobile recommendations (horizontal scroll row) */}
                <section className="lg:hidden mt-6">
                  <h2 className="text-base font-medium mb-3">推荐电影</h2>
                  {recsLoading ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[280px]">
                          <Skeleton variant="horizontal" />
                        </div>
                      ))}
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {recommendations.map((rec) => (
                        <div key={rec.id} className="flex-shrink-0 w-[300px]">
                          <MovieCard
                            movie={rec}
                            variant="horizontal"
                            onAddToWatchlist={addToWatchlist}
                            onRemoveFromWatchlist={removeFromWatchlist}
                            isInWatchlist={isInWatchlist(rec.id)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty title="暂无推荐" />
                  )}
                </section>
              </div>

              {/* ===== RIGHT column (desktop only) ===== */}
              <aside className="hidden lg:block w-[400px] flex-shrink-0">
                <h2 className="text-base font-medium mb-3">推荐电影</h2>
                {recsLoading
                  ? recommendationsSkeleton
                  : recommendations.length > 0
                    ? recommendationsList
                    : <Empty title="暂无推荐" />}
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
