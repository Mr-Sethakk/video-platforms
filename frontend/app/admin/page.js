'use client'

import { useState, useEffect, useCallback } from 'react'
import { Film, Users, TrendingUp, DollarSign, Star, Play } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import DashboardChart from '@/components/admin/DashboardChart'
import { apiFetch } from '@/lib/api'

const MOCK_STATS = {
  todayNewUsers: 28, todayNewUsersChange: 12.5,
  activeUsers: 156, activeUsersChange: -3.2,
  todayOrders: 45, todayOrdersChange: 8.7,
  todayRevenue: 2380, todayRevenueChange: 15.3,
  totalMembers: 832,
}

const REVENUE_TREND = [
  { name: '07/09', value: 1800 }, { name: '07/10', value: 2200 },
  { name: '07/11', value: 3100 }, { name: '07/12', value: 2800 },
  { name: '07/13', value: 3500 }, { name: '07/14', value: 4100 },
  { name: '07/15', value: 3800 },
]

const MEMBER_DIST = [
  { name: 'Free', value: 520 }, { name: 'VIP', value: 210 },
  { name: 'VVIP', value: 75 }, { name: 'SVIP', value: 27 },
]

const CONTENT_DIST = [
  { name: '动作', value: 35, max: 52 }, { name: '科幻', value: 25, max: 52 },
  { name: '剧情', value: 42, max: 52 }, { name: '喜剧', value: 30, max: 52 },
  { name: '悬疑', value: 18, max: 52 }, { name: '动画', value: 22, max: 52 },
]

const HOT_CONTENT = [
  { rank: 1, title: '肖申克的救赎', rating: 9.7, viewCount: '1280万', genre: '剧情' },
  { rank: 2, title: '星际穿越', rating: 9.4, viewCount: '1150万', genre: '科幻' },
  { rank: 3, title: '盗梦空间', rating: 9.3, viewCount: '980万', genre: '科幻' },
  { rank: 4, title: '泰坦尼克号', rating: 9.4, viewCount: '870万', genre: '爱情' },
  { rank: 5, title: '千与千寻', rating: 9.4, viewCount: '820万', genre: '动画' },
  { rank: 6, title: '三傻大闹宝莱坞', rating: 9.2, viewCount: '760万', genre: '喜剧' },
  { rank: 7, title: '楚门的世界', rating: 9.3, viewCount: '710万', genre: '剧情' },
  { rank: 8, title: '你的名字', rating: 8.4, viewCount: '680万', genre: '动画' },
  { rank: 9, title: '看不见的客人', rating: 8.8, viewCount: '650万', genre: '悬疑' },
  { rank: 10, title: '龙猫', rating: 9.2, viewCount: '620万', genre: '动画' },
]

export default function AdminDashboardPage() {
  const [realStats, setRealStats] = useState(null)

  useEffect(() => {
    apiFetch('/admin/stats/dashboard').then(setRealStats).catch(() => {})
  }, [])

  return (
    <AdminLayout title="📊 仪表盘">
      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} title="今日新增用户" value={MOCK_STATS.todayNewUsers} change={MOCK_STATS.todayNewUsersChange} color="brand" />
        <StatCard icon={<TrendingUp size={20} />} title="活跃用户" value={MOCK_STATS.activeUsers} change={MOCK_STATS.activeUsersChange} color="success" />
        <StatCard icon={<DollarSign size={20} />} title="今日收入" value={`¥${MOCK_STATS.todayRevenue.toLocaleString()}`} change={MOCK_STATS.todayRevenueChange} color="warning" />
        <StatCard icon={<Film size={20} />} title="总电影数" value={realStats?.totalMovies ?? '---'} color="brand" />
      </div>

      {/* ===== Charts Row 1 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <DashboardChart title="📈 收入趋势 (近7天)" subtitle="单位: 元" data={REVENUE_TREND} dataKey="value" color="#6366F1" />
        <DashboardChart title="🍩 会员分布" subtitle={`总会员 ${MOCK_STATS.totalMembers} 人`} data={MEMBER_DIST} dataKey="value" color="#F59E0B" />
      </div>

      {/* ===== Charts Row 2: Content Distribution ===== */}
      <div className="mt-6">
        <div className="bg-[#212121] rounded-xl p-6 border border-[rgba(255,255,255,0.06)]">
          <h3 className="text-white font-medium mb-4">📊 内容分布</h3>
          {CONTENT_DIST.map((item) => (
            <div key={item.name} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-sm text-[#AAAAAA] w-12 text-right">{item.name}</span>
              <div className="flex-1 h-5 bg-[#303030] rounded-full overflow-hidden">
                <div className="h-full bg-[#6366F1] rounded-full transition-all duration-700" style={{ width: `${(item.value / item.max) * 100}%` }} />
              </div>
              <span className="text-sm text-[#AAAAAA] w-10">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Hot Content Table ===== */}
      <div className="mt-6">
        <div className="bg-[#212121] rounded-xl p-6 border border-[rgba(255,255,255,0.06)]">
          <h3 className="text-white font-medium mb-4">🔥 热门内容 Top 10</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#AAAAAA] border-b border-[rgba(255,255,255,0.08)]">
                  <th className="text-left py-3 pr-4">#</th>
                  <th className="text-left py-3 pr-4">标题</th>
                  <th className="text-left py-3 pr-4">评分</th>
                  <th className="text-left py-3 pr-4">播放量</th>
                  <th className="text-left py-3">类型</th>
                </tr>
              </thead>
              <tbody>
                {HOT_CONTENT.map((item) => (
                  <tr key={item.rank} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[#272727] transition-colors">
                    <td className="py-2.5 pr-4">
                      <span className={`font-bold ${item.rank <= 3 ? 'text-[#F59E0B]' : 'text-[#717171]'}`}>{item.rank}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-white">{item.title}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-[#F59E0B]">⭐ {item.rating}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-[#AAAAAA]">{item.viewCount}</td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-[#303030] px-2 py-0.5 text-xs text-[#AAAAAA]">{item.genre}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
