'use client'

import { useState, useCallback } from 'react'
import { Film, Clock, CheckCircle } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import StatCard from '@/components/admin/StatCard'
import DashboardChart from '@/components/admin/DashboardChart'
import Empty from '@/components/ui/Empty'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { GENRES } from '@/lib/constants'

// Sample chart data
const uploadTrendData = [
  { name: '周一', value: 12 },
  { name: '周二', value: 19 },
  { name: '周三', value: 8 },
  { name: '周四', value: 15 },
  { name: '周五', value: 22 },
  { name: '周六', value: 30 },
  { name: '周日', value: 18 },
]

const categoryDistributionData = [
  { name: '动作', value: 35 },
  { name: '科幻', value: 25 },
  { name: '爱情', value: 20 },
  { name: '喜剧', value: 18 },
  { name: '悬疑', value: 15 },
  { name: '其他', value: 12 },
]

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { isAdmin, isAuthenticated } = useAuth()
  const { count: watchlistCount } = useWatchlist()

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

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
            <h1 className="text-2xl font-bold mb-6">📊 管理后台</h1>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="总视频"
                value="1,248"
                icon={<Film size={20} strokeWidth={1.5} />}
                color="brand"
              />
              <StatCard
                title="待审核"
                value="23"
                icon={<Clock size={20} strokeWidth={1.5} />}
                color="warning"
              />
              <StatCard
                title="已上架"
                value="1,156"
                icon={<CheckCircle size={20} strokeWidth={1.5} />}
                color="success"
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              <DashboardChart
                title="上传趋势"
                data={uploadTrendData}
                dataKey="value"
              />
              <DashboardChart
                title="分类分布"
                data={categoryDistributionData}
                dataKey="value"
              />
            </div>

            {/* Recent pending reviews */}
            <section className="mt-6">
              <h2 className="text-lg font-medium mb-3">最近待审核</h2>
              <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] p-6">
                <p className="text-[#AAAAAA] text-sm">
                  暂无待审核视频
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
