'use client'

import { useState, useEffect, useCallback } from 'react'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import VideoReviewCard from '@/components/admin/VideoReviewCard'
import Empty from '@/components/ui/Empty'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { apiFetch } from '@/lib/api'
import { GENRES } from '@/lib/constants'

export default function AdminReviewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { isAdmin, isAuthenticated } = useAuth()
  const { count: watchlistCount } = useWatchlist()

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const fetchPendingVideos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/admin/videos/pending')
      setVideos(data.records || data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchPendingVideos()
    }
  }, [isAdmin, fetchPendingVideos])

  const handleApprove = useCallback(async (videoId) => {
    try {
      await apiFetch(`/admin/videos/${videoId}/approve`, { method: 'PUT' })
      setVideos((prev) => prev.filter((v) => v.id !== videoId))
    } catch (e) {
      throw e
    }
  }, [])

  const handleReject = useCallback(async (videoId) => {
    try {
      await apiFetch(`/admin/videos/${videoId}/reject`, { method: 'PUT' })
      setVideos((prev) => prev.filter((v) => v.id !== videoId))
    } catch (e) {
      throw e
    }
  }, [])

  const handleSkip = useCallback((videoId) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId))
  }, [])

  // ========== Not admin ==========
  if (!isAuthenticated || !isAdmin) {
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
            <div className="flex items-center justify-center min-h-[400px]">
              <Empty title="无权限访问" description="此页面仅限管理员访问" />
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
          genres={GENRES}
          watchlistCount={watchlistCount}
          isAdmin={isAdmin}
        />

        <main
          className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${
            sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'
          }`}
        >
          <div className="p-6">
            {/* Title */}
            <h1 className="text-2xl font-bold mb-6">✅ 视频审核</h1>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                <p className="text-red-400 text-sm">加载失败: {error}</p>
                <button
                  onClick={fetchPendingVideos}
                  className="mt-2 text-sm text-[#6366F1] hover:underline"
                >
                  重试
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                    <div className="flex gap-4">
                      <div className="w-[168px] h-[94px] bg-[#272727] animate-pulse rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-3/4 bg-[#272727] animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-[#272727] animate-pulse rounded" />
                        <div className="h-3 w-2/3 bg-[#272727] animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Video list */}
            {!loading && videos.length > 0 && (
              <div className="space-y-4">
                {videos.map((video) => (
                  <VideoReviewCard
                    key={video.id}
                    video={video}
                    onApprove={() => handleApprove(video.id)}
                    onReject={() => handleReject(video.id)}
                    onSkip={() => handleSkip(video.id)}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && videos.length === 0 && (
              <Empty
                title="暂无待审核视频"
                description="所有视频已处理完毕"
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
