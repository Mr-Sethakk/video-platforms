'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Play, Edit, Trash2, Clock, Eye } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import Empty from '@/components/ui/Empty'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { apiFetch } from '@/lib/api'

const STATUS_MAP = {
  PUBLISHED: { label: '已发布', style: 'bg-[#22C55E]/20 text-[#22C55E]' },
  PROCESSING: { label: '转码中', style: 'bg-[#F59E0B]/20 text-[#F59E0B]' },
  ARCHIVED: { label: '已归档', style: 'bg-[#717171]/20 text-[#AAAAAA]' },
}

const VIP_COLORS = {
  USER:  'bg-[#6B7280]/20 text-[#9CA3AF]',
  VIP:   'bg-[#F59E0B]/20 text-[#F59E0B]',
  VVIP:  'bg-[#6366F1]/20 text-[#6366F1]',
  SVIP:  'bg-[#EF4444]/20 text-[#EF4444]',
}

export default function AdminVideosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { isAdmin, isAuthenticated } = useAuth()
  const { count: watchlistCount } = useWatchlist()

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/admin/videos')
      setVideos(data.records || data.videos || [])
    } catch {
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  // Filter
  const filtered = videos.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false
    if (searchInput.trim() && !(v.title || '').toLowerCase().includes(searchInput.toLowerCase())) return false
    return true
  })

  // Delete handler
  const handleDelete = useCallback(async (id) => {
    if (!confirm('确认删除此视频？删除后不可恢复。')) return
    try {
      await apiFetch(`/admin/videos/${id}`, { method: 'DELETE' })
      setVideos((prev) => prev.filter((v) => v.id !== id))
    } catch {
      // Handle silently
    }
  }, [])

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="flex pt-14">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} watchlistCount={watchlistCount} isAdmin={isAdmin} />
          <main className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'}`}>
            <div className="flex items-center justify-center min-h-[400px]">
              <Empty title="无权限访问" description="此页面仅限管理员访问" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} watchlistCount={watchlistCount} isAdmin={isAdmin} />
        <main className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'}`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold">🎬 视频管理</h1>
              <Link
                href="/admin/videos/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6366F1] text-white text-sm font-medium hover:bg-[#4F46E5] transition-colors self-start"
              >
                <Plus size={16} strokeWidth={1.5} />
                上传视频
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="搜索视频标题..."
                  className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 pl-9 text-white placeholder:text-[#888] text-sm"
                />
              </div>
              <div className="flex gap-2">
                {['ALL', 'PUBLISHED', 'PROCESSING', 'ARCHIVED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === s
                        ? 'bg-white text-black'
                        : 'bg-[#303030] text-white hover:bg-[#3F3F3F]'
                    }`}
                  >
                    {s === 'ALL' ? '全部' : STATUS_MAP[s]?.label || s}
                  </button>
                ))}
              </div>
            </div>

            {/* Video list */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} variant="horizontal" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((video) => {
                  const status = STATUS_MAP[video.status] || STATUS_MAP.PUBLISHED
                  const vipClass = VIP_COLORS[video.requiredVipLevel] || VIP_COLORS.USER
                  return (
                    <div
                      key={video.id}
                      className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-[#272727] transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="w-full sm:w-[160px] h-[90px] rounded-lg overflow-hidden bg-[#0F0F0F] shrink-0 relative">
                        {video.coverUrl ? (
                          <img src={video.coverUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play size={24} strokeWidth={1.5} className="text-[#3F3F3F]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-sm font-medium line-clamp-1">
                          {video.title}
                        </h3>
                        <p className="text-[#AAAAAA] text-xs mt-1 line-clamp-1">
                          {video.movieTitle || video.description || '暂无简介'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.style}`}>
                            {status.label}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${vipClass}`}>
                            {video.requiredVipLevel || 'USER'}
                          </span>
                          {video.duration && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#303030] text-[#AAAAAA] flex items-center gap-1">
                              <Clock size={10} /> {Math.floor(video.duration / 60)}分钟
                            </span>
                          )}
                          {video.viewCount > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#303030] text-[#AAAAAA] flex items-center gap-1">
                              <Eye size={10} /> {video.viewCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/videos/upload?id=${video.id}`}
                          className="w-8 h-8 rounded-full hover:bg-[#3F3F3F] flex items-center justify-center transition-colors"
                          title="编辑"
                        >
                          <Edit size={16} strokeWidth={1.5} className="text-[#AAAAAA]" />
                        </Link>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="w-8 h-8 rounded-full hover:bg-red-500/20 flex items-center justify-center transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} strokeWidth={1.5} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Empty
                title="暂无视频"
                description={searchInput ? '没有匹配的视频' : '点击"上传视频"开始添加'}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
