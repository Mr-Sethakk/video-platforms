'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Monitor, Zap, Crown } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import Modal from '@/components/ui/Modal'

const STORAGE_KEY = 'admin_membership_plans'

const DEFAULT_PLANS = [
  { id: 1, name: '月度VIP', price: 29.9, duration: 30, devices: 2, quality: 'HD', features: ['1080P高清', '无广告', '极速播放'], status: 1, sortOrder: 1 },
  { id: 2, name: '季度VIP', price: 79.9, duration: 90, devices: 3, quality: 'FHD', features: ['4K超清', '无广告', '极速播放', '多端同步'], status: 1, sortOrder: 2 },
  { id: 3, name: '年度VIP', price: 299, duration: 365, devices: 4, quality: '4K', features: ['4K超清', '无广告', '离线下载', '多端同步', '专属客服'], status: 1, sortOrder: 3 },
]

const QUALITY_ICONS = { SD: Monitor, HD: Monitor, FHD: Zap, '4K': Crown }
const QUALITY_GRADIENTS = { SD: 'from-[#717171]', HD: 'from-[#10B981]', FHD: 'from-[#6366F1]', '4K': 'from-[#EF4444]' }

function loadPlans() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : DEFAULT_PLANS }
  catch { return DEFAULT_PLANS }
}

export default function AdminMembershipPage() {
  const [plans, setPlans] = useState(loadPlans)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', duration: '', devices: '', quality: 'HD', features: '', status: 1 })

  const saveToStorage = (data) => { setPlans(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

  const openModal = (plan) => {
    if (plan) {
      setEditing(plan)
      setForm({ name: plan.name, price: String(plan.price), duration: String(plan.duration), devices: String(plan.devices), quality: plan.quality, features: (plan.features || []).join(', '), status: plan.status })
    } else {
      setEditing(null)
      setForm({ name: '', price: '', duration: '30', devices: '2', quality: 'HD', features: '', status: 1 })
    }
    setModalOpen(true)
  }

  const handleSave = () => {
    const planData = {
      name: form.name,
      price: parseFloat(form.price) || 0,
      duration: parseInt(form.duration) || 30,
      devices: parseInt(form.devices) || 1,
      quality: form.quality,
      features: form.features.split(',').map(s => s.trim()).filter(Boolean),
      status: form.status,
      sortOrder: editing ? editing.sortOrder : plans.length + 1,
    }
    let next
    if (editing) {
      next = plans.map(p => p.id === editing.id ? { ...p, ...planData } : p)
    } else {
      next = [...plans, { id: Date.now(), ...planData }]
    }
    saveToStorage(next)
    setModalOpen(false)
  }

  const handleDelete = (id) => { saveToStorage(plans.filter(p => p.id !== id)) }

  return (
    <AdminLayout title="💎 会员套餐管理">
      <div className="flex justify-end mb-6">
        <button onClick={() => openModal(null)} className="flex items-center gap-1.5 rounded-full bg-[#6366F1] text-white px-4 py-2 text-sm hover:bg-[#4F46E5] transition-colors"><Plus size={16} /> 新增套餐</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.sort((a, b) => a.sortOrder - b.sortOrder).map(plan => {
          const QIcon = QUALITY_ICONS[plan.quality] || Monitor
          const gradient = QUALITY_GRADIENTS[plan.quality] || 'from-[#717171]'
          return (
            <div key={plan.id} className="relative group">
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} to-transparent opacity-20 blur-xl`} />
              <div className="relative bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 hover:border-[rgba(255,255,255,0.15)] transition-all">
                {/* Hover actions */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(plan)} className="p-1.5 rounded-full bg-[#303030] text-[#AAAAAA] hover:text-white hover:bg-[#3F3F3F] transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-full bg-[#303030] text-[#AAAAAA] hover:text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"><Trash2 size={14} /></button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <QIcon size={20} className="text-[#6366F1]" />
                  <span className="text-sm text-[#717171]">{plan.quality} 画质</span>
                </div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-2">
                  <span className="text-3xl font-bold text-white">¥{plan.price}</span>
                  <span className="text-sm text-[#717171]">/{plan.duration}天</span>
                </p>
                <p className="text-xs text-[#AAAAAA] mt-1">最多 {plan.devices} 台设备同时在线</p>
                <div className="mt-4 space-y-1.5">
                  {(plan.features || []).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#AAAAAA]">
                      <span className="text-[#10B981]">✓</span> {f}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${plan.status === 1 ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                    {plan.status === 1 ? '已上架' : '已下架'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑套餐' : '新增套餐'} maxWidth="max-w-xl">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-[#AAAAAA]">套餐名称</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
            <div><label className="text-xs text-[#AAAAAA]">价格(元)</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
            <div><label className="text-xs text-[#AAAAAA]">时长(天)</label><input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
            <div><label className="text-xs text-[#AAAAAA]">设备数</label><input type="number" value={form.devices} onChange={e => setForm({...form, devices: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
            <div><label className="text-xs text-[#AAAAAA]">画质</label><select value={form.quality} onChange={e => setForm({...form, quality: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm"><option>SD</option><option>HD</option><option>FHD</option><option>4K</option></select></div>
            <div><label className="text-xs text-[#AAAAAA]">状态</label><select value={form.status} onChange={e => setForm({...form, status: Number(e.target.value)})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm"><option value={1}>上架</option><option value={0}>下架</option></select></div>
          </div>
          <div><label className="text-xs text-[#AAAAAA]">功能列表 (逗号分隔)</label><input value={form.features} onChange={e => setForm({...form, features: e.target.value})} placeholder="1080P高清, 无广告, 极速播放" className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-full bg-[#303030] text-white px-6 py-2 text-sm hover:bg-[#3F3F3F] transition-colors">取消</button>
            <button onClick={handleSave} className="rounded-full bg-[#6366F1] text-white px-6 py-2 text-sm hover:bg-[#4F46E5] transition-colors">保存</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
