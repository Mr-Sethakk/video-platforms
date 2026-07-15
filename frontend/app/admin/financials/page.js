'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, ShoppingCart, CreditCard } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import DashboardChart from '@/components/admin/DashboardChart'

const PERIODS = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' },
]

const FINANCIAL_STATS = {
  today: { totalRevenue: '¥12,380', periodRevenue: '¥2,180', totalOrders: 45, avgAmount: '¥48.4' },
  week: { totalRevenue: '¥86,200', periodRevenue: '¥15,600', totalOrders: 312, avgAmount: '¥50.0' },
  month: { totalRevenue: '¥352,000', periodRevenue: '¥68,500', totalOrders: 1240, avgAmount: '¥55.2' },
  year: { totalRevenue: '¥4,280,000', periodRevenue: '¥820,000', totalOrders: 14800, avgAmount: '¥55.4' },
}

const REVENUE_TREND = [
  { name: '07/09', value: 1800 }, { name: '07/10', value: 2200 }, { name: '07/11', value: 3400 },
  { name: '07/12', value: 2800 }, { name: '07/13', value: 4100 }, { name: '07/14', value: 3600 },
  { name: '07/15', value: 4200 },
]

const PLAN_SALES = [
  { name: '月度VIP', value: 450 }, { name: '季度VIP', value: 280 },
  { name: '年度VIP', value: 150 }, { name: '永久SVIP', value: 40 },
]

const PAYMENT_METHODS = [
  { name: '微信支付', value: 520 }, { name: '支付宝', value: 380 },
]

export default function AdminFinancialsPage() {
  const [period, setPeriod] = useState('month')
  const stats = FINANCIAL_STATS[period]

  return (
    <AdminLayout title="💰 财务管理">
      {/* Period switcher */}
      <div className="flex gap-2 mb-6">
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${period === p.key ? 'bg-white text-black' : 'bg-[#303030] text-white hover:bg-[#3F3F3F]'}`}>{p.label}</button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign size={20} />} title="总收入" value={stats.totalRevenue} color="brand" />
        <StatCard icon={<TrendingUp size={20} />} title="当期收入" value={stats.periodRevenue} change={period === 'month' ? 12.5 : undefined} color="success" />
        <StatCard icon={<ShoppingCart size={20} />} title="总订单数" value={stats.totalOrders} color="warning" />
        <StatCard icon={<CreditCard size={20} />} title="平均订单金额" value={stats.avgAmount} color="brand" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <DashboardChart title="📈 收入趋势" data={REVENUE_TREND} dataKey="value" color="#EF4444" />
        <DashboardChart title="🍩 套餐销售分布" data={PLAN_SALES} dataKey="value" color="#6366F1" />
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <DashboardChart title="💳 支付方式分布" data={PAYMENT_METHODS} dataKey="value" color="#10B981" />
      </div>
    </AdminLayout>
  )
}
