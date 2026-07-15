'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'

const MOCK_ORDERS = [
  { id: 'ORD-20260715-001', username: 'zhangsan', planName: '月度VIP', amount: 29.9, payment: '微信支付', status: 'paid', createdAt: '2026-07-15 10:23' },
  { id: 'ORD-20260715-002', username: 'lisi', planName: '年度VIP', amount: 299, payment: '支付宝', status: 'paid', createdAt: '2026-07-15 09:15' },
  { id: 'ORD-20260714-003', username: 'wangwu', planName: '季度VIP', amount: 79.9, payment: '微信支付', status: 'pending', createdAt: '2026-07-14 22:08' },
  { id: 'ORD-20260714-004', username: 'zhaoliu', planName: '月度VIP', amount: 29.9, payment: '支付宝', status: 'paid', createdAt: '2026-07-14 18:45' },
  { id: 'ORD-20260713-005', username: 'sunqi', planName: '月度VIP', amount: 29.9, payment: '微信支付', status: 'refunded', createdAt: '2026-07-13 14:30' },
  { id: 'ORD-20260713-006', username: 'zhouba', planName: '年度VIP', amount: 299, payment: '支付宝', status: 'expired', createdAt: '2026-07-13 08:00' },
  { id: 'ORD-20260712-007', username: 'wujiu', planName: '季度VIP', amount: 79.9, payment: '微信支付', status: 'cancelled', createdAt: '2026-07-12 16:22' },
]

const STATUS_CONFIG = {
  paid: { label: '已支付', style: 'bg-[#10B981]/20 text-[#10B981]' },
  pending: { label: '待支付', style: 'bg-[#F59E0B]/20 text-[#F59E0B]' },
  refunded: { label: '已退款', style: 'bg-[#EF4444]/20 text-[#EF4444]' },
  expired: { label: '已过期', style: 'bg-[#717171]/20 text-[#717171]' },
  cancelled: { label: '已取消', style: 'bg-[#717171]/20 text-[#717171]' },
}

export default function AdminOrdersPage() {
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [orders] = useState(MOCK_ORDERS)

  const filtered = orders.filter(o => {
    if (keyword && !o.id.includes(keyword) && !o.username.includes(keyword)) return false
    if (statusFilter && o.status !== statusFilter) return false
    return true
  })

  return (
    <AdminLayout title="📋 订单管理">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索订单号/用户名..." className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none pl-10 pr-4 text-white text-sm" />
        </div>
        {['', 'paid', 'pending', 'refunded', 'expired', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${statusFilter === s ? 'bg-white text-black' : 'bg-[#303030] text-white hover:bg-[#3F3F3F]'}`}>{s ? STATUS_CONFIG[s].label : '全部'}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#AAAAAA] border-b border-[rgba(255,255,255,0.08)]">
              <th className="text-left py-3 px-4">订单号</th>
              <th className="text-left py-3 px-4">用户</th>
              <th className="text-left py-3 px-4">套餐</th>
              <th className="text-left py-3 px-4">金额</th>
              <th className="text-left py-3 px-4">支付方式</th>
              <th className="text-left py-3 px-4">状态</th>
              <th className="text-left py-3 px-4">时间</th>
              <th className="text-left py-3 px-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[#272727] transition-colors">
                <td className="py-2.5 px-4 text-[#6366F1] font-mono text-xs">{o.id}</td>
                <td className="py-2.5 px-4 text-white">{o.username}</td>
                <td className="py-2.5 px-4 text-[#AAAAAA]">{o.planName}</td>
                <td className="py-2.5 px-4 text-[#F59E0B] font-medium">¥{o.amount}</td>
                <td className="py-2.5 px-4 text-[#AAAAAA]">{o.payment}</td>
                <td className="py-2.5 px-4"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[o.status]?.style}`}>{STATUS_CONFIG[o.status]?.label}</span></td>
                <td className="py-2.5 px-4 text-[#AAAAAA]">{o.createdAt}</td>
                <td className="py-2.5 px-4">
                  {o.status === 'pending' && (
                    <button className="text-sm text-[#10B981] hover:underline mr-2">审核通过</button>
                  )}
                  <button className="text-sm text-[#6366F1] hover:underline">详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
