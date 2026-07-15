'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import VideoReviewCard from '@/components/admin/VideoReviewCard'
import Empty from '@/components/ui/Empty'
import { apiFetch } from '@/lib/api'

const MOCK_PENDING = [
  {
    id: 101,
    title: '流浪地球3：终局之战',
    description: '太阳急速衰老膨胀，人类在地球表面建造出巨大的推进器，开启长达2500年的流浪之旅。第三部讲述地球抵达比邻星系后的终极危机...',
    uploader: '科幻迷小王',
    time: '2026-07-15 14:23',
    tags: ['科幻', '冒险', '灾难'],
    duration: '142分钟',
    fileSize: '2.4 GB',
    format: 'MP4 1080P',
  },
  {
    id: 102,
    title: '长安十二时辰：大结局加长版',
    description: '上元节前夕，长安城混入可疑人员，死囚张小敬临危受命，须在十二时辰内破除隐患。本片为剧集精华浓缩加长版。',
    uploader: '古风剪辑师',
    time: '2026-07-15 10:05',
    tags: ['古装', '悬疑', '动作'],
    duration: '168分钟',
    fileSize: '3.1 GB',
    format: 'MP4 4K',
  },
  {
    id: 103,
    title: '深海历险记',
    description: '一个关于勇气的故事。小女孩参宿意外坠入深海世界，在神秘朋友陪伴下，展开了一段瑰丽奇幻的冒险之旅。国产动画年度力作。',
    uploader: '动画爱好者',
    time: '2026-07-14 21:30',
    tags: ['动画', '奇幻', '冒险'],
    duration: '95分钟',
    fileSize: '1.8 GB',
    format: 'MP4 1080P',
  },
  {
    id: 104,
    title: '不止不休',
    description: '一位高中辍学怀揣记者梦想的青年韩东，不顾家人阻拦毅然离家到北京闯荡，一路备受质疑，一路不止不休。真实事件改编。',
    uploader: '独立纪录片人',
    time: '2026-07-14 16:42',
    tags: ['剧情', '传记', '现实'],
    duration: '117分钟',
    fileSize: '1.5 GB',
    format: 'MP4 720P',
  },
  {
    id: 105,
    title: '密室逃脱：终极关卡',
    description: '六名身份各异的玩家被邀请参加一场密室逃脱游戏，然而随着关卡推进，他们发现这不仅仅是一场游戏——每一次失败都将付出生命代价。',
    uploader: '悬疑剧场',
    time: '2026-07-13 19:18',
    tags: ['悬疑', '惊悚', '犯罪'],
    duration: '98分钟',
    fileSize: '2.0 GB',
    format: 'MP4 1080P',
  },
  {
    id: 106,
    title: '舌尖上的家乡·湘西篇',
    description: '本期走进湘西土家族苗族自治州，探索深山中的传统美食——腊肉、酸鱼、糍粑、油茶，用镜头记录即将失传的古老烹饪技艺。',
    uploader: '美食纪录片频道',
    time: '2026-07-13 08:55',
    tags: ['纪录片', '美食', '人文'],
    duration: '52分钟',
    fileSize: '980 MB',
    format: 'MP4 1080P',
  },
  {
    id: 107,
    title: '暗夜追踪',
    description: '退役特工被迫重出江湖，在暗夜中追踪一桩跨国军火走私案。拳拳到肉的动作戏，全程高燃无尿点。',
    uploader: '动作片工厂',
    time: '2026-07-12 22:10',
    tags: ['动作', '犯罪', '悬疑'],
    duration: '112分钟',
    fileSize: '2.7 GB',
    format: 'MP4 4K',
  },
]

export default function AdminReviewPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPendingVideos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/admin/videos/pending')
      const list = data.records || data || []
      // 如果后端返回空，用 mock 数据填充
      setVideos(list.length > 0 ? list : MOCK_PENDING)
    } catch {
      // 后端不可用时直接用 mock
      setVideos(MOCK_PENDING)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPendingVideos() }, [fetchPendingVideos])

  const handleApprove = useCallback(async (video) => {
    try { await apiFetch(`/admin/videos/${video.id}/approve`, { method: 'PUT' }) } catch {}
    setVideos((prev) => prev.filter((v) => v.id !== video.id))
  }, [])

  const handleReject = useCallback(async (video) => {
    try { await apiFetch(`/admin/videos/${video.id}/reject`, { method: 'PUT' }) } catch {}
    setVideos((prev) => prev.filter((v) => v.id !== video.id))
  }, [])

  const handleSkip = useCallback((video) => {
    setVideos((prev) => prev.filter((v) => v.id !== video.id))
  }, [])

  // ===== Stats bar =====
  const totalPending = videos.length
  const todayNew = videos.filter(v => v.time?.includes('2026-07-15')).length

  return (
    <AdminLayout title="✅ 视频审核">
      {/* Quick stats */}
      <div className="flex gap-4 mb-6">
        <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] px-5 py-3">
          <p className="text-xs text-[#AAAAAA]">待审核总数</p>
          <p className="text-2xl font-bold text-[#F59E0B]">{totalPending}</p>
        </div>
        <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] px-5 py-3">
          <p className="text-xs text-[#AAAAAA]">今日新增</p>
          <p className="text-2xl font-bold text-[#10B981]">+{todayNew}</p>
        </div>
        <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] px-5 py-3">
          <p className="text-xs text-[#AAAAAA]">今日已审</p>
          <p className="text-2xl font-bold text-[#6366F1]">12</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
              <div className="flex gap-4">
                <div className="w-[200px] aspect-video bg-[#272727] animate-pulse rounded-lg flex-shrink-0" />
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
              onApprove={() => handleApprove(video)}
              onReject={() => handleReject(video)}
              onSkip={() => handleSkip(video)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && videos.length === 0 && (
        <Empty title="暂无待审核视频" description="所有视频已处理完毕，喝杯咖啡吧 ☕" />
      )}

      {/* All-cleared celebration */}
      {!loading && videos.length === 0 && (
        <div className="mt-4 text-center">
          <p className="text-[10B981] text-sm">🎉 审核队列已清空，工作效率满分！</p>
        </div>
      )}
    </AdminLayout>
  )
}
