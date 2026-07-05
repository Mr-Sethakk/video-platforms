'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, User as UserIcon } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import MovieCard from '@/components/movie/MovieCard'
import Skeleton from '@/components/ui/Skeleton'
import Empty from '@/components/ui/Empty'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { apiFetch } from '@/lib/api'
import { API_BASE } from '@/lib/constants'

export default function MovieDetailPage() {
  const { id } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [recsLoading, setRecsLoading] = useState(false)

  // Comment state
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  const { isAdmin, isAuthenticated, user } = useAuth()
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

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true)
    try {
      const data = await apiFetch(`/comments?movieId=${id}&pageSize=50`)
      setComments(data.records || [])
    } catch {
      // Comments may fail if endpoint not ready
    } finally {
      setCommentsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchMovie()
    fetchRecommendations()
    fetchComments()
  }, [fetchMovie, fetchRecommendations, fetchComments])

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

  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim() || commentSubmitting) return
    setCommentSubmitting(true)
    try {
      await apiFetch('/comments', {
        method: 'POST',
        body: JSON.stringify({ movieId: Number(id), content: commentText.trim() }),
      })
      setCommentText('')
      fetchComments()
    } catch (e) {
      // Error handled silently
    } finally {
      setCommentSubmitting(false)
    }
  }, [commentText, commentSubmitting, id, fetchComments])

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
                  <img
                    src={`${API_BASE}/posters/${movie.id}`}
                    alt={movie.title}
                    className="w-full max-h-[500px] object-contain bg-[#0F0F0F]"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
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

                {/* Comments section */}
                <section>
                  <h2 className="text-base font-medium mb-4">💬 评论 ({comments.length})</h2>

                  {/* Comment form — only for logged-in users */}
                  {isAuthenticated ? (
                    <div className="flex gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center shrink-0 mt-1">
                        <UserIcon size={14} strokeWidth={2} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="写下你的评论..."
                          rows={3}
                          className="w-full bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#717171] resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim() || commentSubmitting}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6366F1] text-white text-sm font-medium hover:bg-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {commentSubmitting ? (
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send size={14} strokeWidth={2} />
                            )}
                            发表
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#212121] rounded-xl border border-[#303030] p-4 text-center mb-6">
                      <p className="text-sm text-[#AAAAAA]">
                        请先
                        <Link href={`/login?redirect=/movies/${id}`} className="text-[#6366F1] hover:underline mx-1">
                          登录
                        </Link>
                        后再评论
                      </p>
                    </div>
                  )}

                  {/* Comment list */}
                  {commentsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-[#212121] rounded-xl p-4 animate-pulse">
                          <div className="h-3 w-20 bg-[#303030] rounded mb-2" />
                          <div className="h-3 w-full bg-[#303030] rounded mb-1" />
                          <div className="h-3 w-3/4 bg-[#303030] rounded" />
                        </div>
                      ))}
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-3">
                      {comments.map((c, i) => (
                        <div key={c.id || i} className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-[#6366F1]/30 flex items-center justify-center">
                              <UserIcon size={12} strokeWidth={2} className="text-[#6366F1]" />
                            </div>
                            <span className="text-xs text-[#AAAAAA] font-medium">
                              {c.username || '用户'}
                            </span>
                            <span className="text-xs text-[#717171]">
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString('zh-CN') : ''}
                            </span>
                          </div>
                          <p className="text-sm text-white leading-relaxed">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#717171] text-center py-4">暂无评论，来说点什么吧</p>
                  )}
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
