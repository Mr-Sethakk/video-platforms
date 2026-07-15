'use client'

import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import Modal from '@/components/ui/Modal'

// localStorage 持久化的分类数据
const STORAGE_KEY = 'admin_categories'

const DEFAULT_CATEGORIES = [
  { id: 1, name: '动作', type: 'genre', sortOrder: 1 },
  { id: 2, name: '喜剧', type: 'genre', sortOrder: 2 },
  { id: 3, name: '科幻', type: 'genre', sortOrder: 3 },
  { id: 4, name: '爱情', type: 'genre', sortOrder: 4 },
  { id: 5, name: '恐怖', type: 'genre', sortOrder: 5 },
  { id: 6, name: '动画', type: 'genre', sortOrder: 6 },
  { id: 7, name: '剧情', type: 'genre', sortOrder: 7 },
  { id: 8, name: '悬疑', type: 'genre', sortOrder: 8 },
  { id: 9, name: '中国大陆', type: 'region', sortOrder: 1 },
  { id: 10, name: '美国', type: 'region', sortOrder: 2 },
  { id: 11, name: '韩国', type: 'region', sortOrder: 3 },
  { id: 12, name: '日本', type: 'region', sortOrder: 4 },
  { id: 13, name: '2025', type: 'year', sortOrder: 1 },
  { id: 14, name: '2024', type: 'year', sortOrder: 2 },
  { id: 15, name: '2023', type: 'year', sortOrder: 3 },
  { id: 16, name: '热门推荐', type: 'tag', sortOrder: 1 },
  { id: 17, name: '高分经典', type: 'tag', sortOrder: 2 },
  { id: 18, name: '新片速递', type: 'tag', sortOrder: 3 },
]

const TYPE_LABELS = { genre: '类型', region: '地区', year: '年份', tag: '标签' }
const TYPE_COLORS = { genre: '#6366F1', region: '#10B981', year: '#F59E0B', tag: '#EF4444' }

function loadCategories() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES }
  catch { return DEFAULT_CATEGORIES }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(loadCategories)
  const [filterType, setFilterType] = useState('')
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'genre', sortOrder: 1 })

  const saveToStorage = (data) => { setCategories(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

  const grouped = () => {
    const filtered = categories.filter(c => {
      if (filterType && c.type !== filterType) return false
      if (keyword && !c.name.includes(keyword)) return false
      return true
    })
    const groups = {}
    filtered.forEach(c => { if (!groups[c.type]) groups[c.type] = []; groups[c.type].push(c) })
    return groups
  }

  const openModal = (cat) => {
    if (cat) { setEditing(cat); setForm({ name: cat.name, type: cat.type, sortOrder: cat.sortOrder }) }
    else { setEditing(null); setForm({ name: '', type: filterType || 'genre', sortOrder: 1 }) }
    setModalOpen(true)
  }

  const handleSave = () => {
    let next
    if (editing) {
      next = categories.map(c => c.id === editing.id ? { ...c, ...form } : c)
    } else {
      const newId = Math.max(0, ...categories.map(c => c.id)) + 1
      next = [...categories, { id: newId, ...form }]
    }
    saveToStorage(next)
    setModalOpen(false)
  }

  const handleDelete = (id) => {
    saveToStorage(categories.filter(c => c.id !== id))
  }

  return (
    <AdminLayout title="🏷️ 分类管理">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索分类..." className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none pl-10 pr-4 text-white text-sm" />
        </div>
        {['', ...Object.keys(TYPE_LABELS)].map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filterType === t ? 'bg-white text-black' : 'bg-[#303030] text-white hover:bg-[#3F3F3F]'}`}>{t ? TYPE_LABELS[t] : '全部'}</button>
        ))}
        <button onClick={() => openModal(null)} className="flex items-center gap-1.5 rounded-full bg-[#6366F1] text-white px-4 py-2 text-sm hover:bg-[#4F46E5] transition-colors ml-auto"><Plus size={16} /> 新增</button>
      </div>

      {/* Category groups */}
      {Object.entries(grouped()).map(([type, items]) => (
        <div key={type} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full" style={{ background: TYPE_COLORS[type] || '#717171' }} />
            <h3 className="text-base font-medium text-white">{TYPE_LABELS[type] || type}</h3>
            <span className="text-xs bg-[#303030] text-[#AAAAAA] rounded-full px-2 py-0.5">{items.length}</span>
          </div>
          <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            {items.sort((a, b) => a.sortOrder - b.sortOrder).map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-b-0 hover:bg-[#272727] transition-colors">
                <GripVertical size={14} className="text-[#444] cursor-grab" />
                <span className="text-sm text-white flex-1">{item.name}</span>
                <span className="text-xs text-[#717171]">排序: {item.sortOrder}</span>
                <button onClick={() => openModal(item)} className="p-1.5 rounded-full hover:bg-[#303030] text-[#AAAAAA] hover:text-white transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-full hover:bg-[#EF4444]/20 text-[#AAAAAA] hover:text-[#EF4444] transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑分类' : '新增分类'}>
        <div className="space-y-3">
          <div><label className="text-xs text-[#AAAAAA]">名称</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
          <div><label className="text-xs text-[#AAAAAA]">类型</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm">{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="text-xs text-[#AAAAAA]">排序号</label><input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: Number(e.target.value)})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-full bg-[#303030] text-white px-6 py-2 text-sm hover:bg-[#3F3F3F] transition-colors">取消</button>
            <button onClick={handleSave} className="rounded-full bg-[#6366F1] text-white px-6 py-2 text-sm hover:bg-[#4F46E5] transition-colors">保存</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
