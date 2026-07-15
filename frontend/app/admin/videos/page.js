'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Play, Edit, Trash2, Clock, Eye, Monitor, Film } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import Empty from '@/components/ui/Empty'
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

const MOCK_VIDEOS = [
  {
    id: 1, title: '肖申克的救赎 · 预告片', movieTitle: '肖申克的救赎',
    status: 'PUBLISHED', requiredVipLevel: 'USER', duration: 142, viewCount: 12800, fileSize: '223 MB',
    coverUrl: '', createdAt: '2026-07-10', description: '希望让人自由——银行家安迪被误判入狱，用二十年完成惊天越狱。',
  },
  {
    id: 2, title: '星际穿越 · 预告片', movieTitle: '星际穿越',
    status: 'PUBLISHED', requiredVipLevel: 'VIP', duration: 169, viewCount: 11500, fileSize: '346 MB',
    coverUrl: '', createdAt: '2026-07-09', description: '爱是超越时空的力量。末世宇航员库珀穿越虫洞寻找新家园。',
  },
  {
    id: 3, title: '流浪地球3 · 先行预告', movieTitle: '流浪地球3',
    status: 'PROCESSING', requiredVipLevel: 'VVIP', duration: 90, viewCount: 0, fileSize: '1.8 GB',
    coverUrl: '', createdAt: '2026-07-15', description: '地球抵达比邻星系后的终极危机——正在转码中，预计3小时后完成。',
  },
  {
    id: 4, title: '盗梦空间 · 精彩片段', movieTitle: '盗梦空间',
    status: 'PUBLISHED', requiredVipLevel: 'USER', duration: 148, viewCount: 9800, fileSize: '216 MB',
    coverUrl: '', createdAt: '2026-07-08', description: '道姆·柯布是专门潜入他人梦境窃取秘密的高手。',
  },
  {
    id: 5, title: '长安十二时辰 · 大结局加长版', movieTitle: '长安十二时辰',
    status: 'PROCESSING', requiredVipLevel: 'VIP', duration: 168, viewCount: 0, fileSize: '3.1 GB',
    coverUrl: '', createdAt: '2026-07-15', description: '上元节前夕，死囚张小敬临危受命——AI正在提取关键帧生成缩略图。',
  },
  {
    id: 6, title: '深海历险记 · 完整版', movieTitle: '深海历险记',
    status: 'PUBLISHED', requiredVipLevel: 'USER', duration: 95, viewCount: 6200, fileSize: '1.8 GB',
    coverUrl: '', createdAt: '2026-07-05', description: '国产动画年度力作——少女参宿的深海奇幻冒险。',
  },
  {
    id: 7, title: '千与千寻 · 修复版', movieTitle: '千与千寻',
    status: 'ARCHIVED', requiredVipLevel: 'USER', duration: 125, viewCount: 32000, fileSize: '890 MB',
    coverUrl: '', createdAt: '2026-06-20', description: '不要忘记自己的名字——宫崎骏经典，4K修复重映版。',
  },
  {
    id: 8, title: '密室逃脱 · 终极关卡', movieTitle: '密室逃脱',
    status: 'PUBLISHED', requiredVipLevel: 'VVIP', duration: 98, viewCount: 4100, fileSize: '2.0 GB',
    coverUrl: '', createdAt: '2026-07-12', description: '六名玩家受邀参加密室逃脱游戏，却发现每一次失败都将付出生命代价。',
  },
  {
    id: 9, title: '不止不休 · 导演剪辑版', movieTitle: '不止不休',
    status: 'ARCHIVED', requiredVipLevel: 'USER', duration: 132, viewCount: 8900, fileSize: '1.5 GB',
    coverUrl: '', createdAt: '2026-06-15', description: '怀揣记者梦想的青年韩东到北京闯荡，一路备受质疑却不止不休。',
  },
  {
    id: 10, title: '舌尖上的家乡 · 湘西篇', movieTitle: '舌尖上的家乡',
    status: 'PUBLISHED', requiredVipLevel: 'USER', duration: 52, viewCount: 15000, fileSize: '980 MB',
    coverUrl: '', createdAt: '2026-07-11', description: '走进湘西深山，探索腊肉、酸鱼、糍粑等即将失传的古老烹饪技艺。',
  },
  {
    id: 11, title: '暗夜追踪 · 1080P', movieTitle: '暗夜追踪',
    status: 'PUBLISHED', requiredVipLevel: 'VIP', duration: 112, viewCount: 7300, fileSize: '2.7 GB',
    coverUrl: '', createdAt: '2026-07-07', description: '退役特工被迫重出江湖，拳拳到肉的高燃动作戏。',
  },
  {
    id: 12, title: '龙猫 · 蓝光修复版', movieTitle: '龙猫',
    status: 'PUBLISHED', requiredVipLevel: 'USER', duration: 86, viewCount: 21000, fileSize: '1.2 GB',
    coverUrl: '', createdAt: '2026-07-03', description: '只有小孩子才能看到龙猫——宫崎骏永恒经典。',
  },
]

export default function AdminVideosPage() {
  const [videos, setVideos] = useState(MOCK_VIDEOS)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Try backend, keep mock if empty
  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/admin/videos')
      const list = data.records || data.videos || []
      if (list.length > 0) setVideos(list)
    } catch {} finally { setLoading(false) }
  }, [])

  // Filter
  const filtered = videos.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false
    if (searchInput.trim() && !(v.title || '').toLowerCase().includes(searchInput.toLowerCase()) && !(v.movieTitle || '').toLowerCase().includes(searchInput.toLowerCase())) return false
    return true
  })

  const handleDelete = useCallback((id) => {
    if (!confirm('确认删除此视频？')) return
    setVideos((prev) => prev.filter((v) => v.id !== id))
  }, [])

  // Quick stats
  const publishedCount = videos.filter(v => v.status === 'PUBLISHED').length
  const processingCount = videos.filter(v => v.status === 'PROCESSING').length
  const totalViews = videos.reduce((sum, v) => sum + (v.viewCount || 0), 0)

  return (
    <AdminLayout title="🎬 视频管理">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] px-4 py-3">
          <p className="text-xs text-[#AAAAAA]">总视频</p>
          <p className="text-xl font-bold text-white mt-0.5">{videos.length}</p>
        </div>
        <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] px-4 py-3">
          <p className="text-xs text-[#AAAAAA]">已发布</p>
          <p className="text-xl font-bold text-[#22C55E] mt-0.5">{publishedCount}</p>
        </div>
        <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] px-4 py-3">
          <p className="text-xs text-[#AAAAAA]">转码中</p>
          <p className="text-xl font-bold text-[#F59E0B] mt-0.5">{processingCount}</p>
        </div>
        <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] px-4 py-3">
          <p className="text-xs text-[#AAAAAA]">总播放</p>
          <p className="text-xl font-bold text-[#6366F1] mt-0.5">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索标题或关联电影..."
              className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 pl-9 text-white placeholder:text-[#888] text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'PUBLISHED', 'PROCESSING', 'ARCHIVED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === s ? 'bg-white text-black' : 'bg-[#303030] text-white hover:bg-[#3F3F3F]'
                }`}
              >
                {s === 'ALL' ? '全部' : STATUS_MAP[s]?.label || s}
              </button>
            ))}
          </div>
        </div>
        <Link
          href="/admin/videos/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6366F1] text-white text-sm font-medium hover:bg-[#4F46E5] transition-colors shrink-0"
        >
          <Plus size={16} strokeWidth={1.5} /> 上传视频
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 flex gap-4">
              <div className="w-[160px] h-[90px] bg-[#272727] animate-pulse rounded-lg shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 bg-[#272727] animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-[#272727] animate-pulse rounded" />
              </div>
            </div>
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
                className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 flex flex-col sm:flex-row gap-4 hover:border-[rgba(255,255,255,0.12)] transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-[160px] h-[90px] rounded-lg overflow-hidden bg-[#0F0F0F] shrink-0 relative flex items-center justify-center">
                  {video.coverUrl ? (
                    <img src={video.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-0.5 text-[#3F3F3F] group-hover:text-[#6366F1] transition-colors">
                      <Film size={24} strokeWidth={1.5} />
                      <span className="text-[10px]">{video.fileSize}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white text-sm font-medium line-clamp-1">{video.title}</h3>
                    {video.fileSize && (
                      <span className="text-[10px] text-[#717171] bg-[#0F0F0F] rounded-full px-2 py-0.5 shrink-0 hidden sm:block">{video.fileSize}</span>
                    )}
                  </div>
                  <p className="text-[#AAAAAA] text-xs mt-1 line-clamp-1">
                    {video.movieTitle ? `关联: ${video.movieTitle}` : video.description || '暂无简介'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.style}`}>
                      {status.label}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${vipClass}`}>
                      {video.requiredVipLevel || 'USER'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#303030] text-[#AAAAAA] flex items-center gap-1">
                      <Clock size={10} /> {video.duration}分钟
                    </span>
                    {video.viewCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#303030] text-[#AAAAAA] flex items-center gap-1">
                        <Eye size={10} /> {video.viewCount.toLocaleString()}
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#303030] text-[#717171] hidden sm:inline-block">
                      {video.createdAt}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
        <Empty title="暂无视频" description={searchInput ? '没有匹配的视频' : '点击"上传视频"开始添加'} />
      )}
    </AdminLayout>
  )
}
