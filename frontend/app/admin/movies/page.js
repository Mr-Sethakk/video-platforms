'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Edit, Trash2, Plus } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import Modal from '@/components/ui/Modal'
import { apiFetch } from '@/lib/api'

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState(new Set())

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)
  const [form, setForm] = useState({ title: '', genre: '', rating: '', year: '', director: '', duration: '', description: '' })

  const fetchMovies = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: '20' })
      if (keyword) params.set('q', keyword)
      const data = await apiFetch(`/movies?${params}`)
      setMovies(data.records || [])
      setTotalPages(data.totalPages || 1)
    } catch { setMovies([]) }
    finally { setLoading(false) }
  }, [keyword])

  useEffect(() => { fetchMovies(page) }, [page, fetchMovies])

  const toggleSelect = (id) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const toggleAll = () => {
    if (selected.size === movies.length) setSelected(new Set())
    else setSelected(new Set(movies.map(m => m.id)))
  }

  // Open modal for add/edit
  const openModal = (movie) => {
    if (movie) {
      setEditingMovie(movie)
      setForm({ title: movie.title || '', genre: movie.genre || '', rating: String(movie.rating || ''), year: String(movie.year || ''), director: movie.director || '', duration: String(movie.duration || ''), description: movie.description || '' })
    } else {
      setEditingMovie(null)
      setForm({ title: '', genre: '', rating: '', year: '', director: '', duration: '', description: '' })
    }
    setModalOpen(true)
  }

  const handleSave = () => {
    // Mock save — just close modal
    setModalOpen(false)
  }

  return (
    <AdminLayout title="🎬 影视管理">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }} placeholder="搜索标题..." className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none pl-10 pr-4 text-white text-sm" />
        </div>
        <button onClick={() => openModal(null)} className="flex items-center gap-1.5 rounded-full bg-[#6366F1] text-white px-4 py-2 text-sm hover:bg-[#4F46E5] transition-colors"><Plus size={16} /> 新增</button>
        {selected.size > 0 && (
          <>
            <button className="rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 px-4 py-2 text-sm hover:bg-[#F59E0B]/30 transition-colors">批量发布</button>
            <button className="rounded-full bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 px-4 py-2 text-sm hover:bg-[#EF4444]/30 transition-colors">批量删除</button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-[#717171] text-sm">加载中...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#AAAAAA] border-b border-[rgba(255,255,255,0.08)]">
                <th className="text-left py-3 px-4"><input type="checkbox" checked={selected.size === movies.length && movies.length > 0} onChange={toggleAll} className="accent-[#6366F1]" /></th>
                <th className="text-left py-3 px-4">海报</th>
                <th className="text-left py-3 px-4">标题</th>
                <th className="text-left py-3 px-4">类型</th>
                <th className="text-left py-3 px-4">评分</th>
                <th className="text-left py-3 px-4">年份</th>
                <th className="text-left py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(m => (
                <tr key={m.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[#272727] transition-colors">
                  <td className="py-2.5 px-4"><input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} className="accent-[#6366F1]" /></td>
                  <td className="py-2.5 px-4">
                    <div className="w-10 h-14 rounded bg-[#303030] overflow-hidden flex-shrink-0">
                      <img src={m.posterUrl || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={e => { e.target.style.display = 'none' }} />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-white font-medium max-w-[200px] truncate">{m.title}</td>
                  <td className="py-2.5 px-4"><span className="rounded-full bg-[#303030] px-2 py-0.5 text-xs text-[#AAAAAA]">{m.genre}</span></td>
                  <td className="py-2.5 px-4"><span className="text-[#F59E0B]">⭐ {m.rating}</span></td>
                  <td className="py-2.5 px-4 text-[#AAAAAA]">{m.year}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(m)} className="p-1.5 rounded-full hover:bg-[#303030] text-[#AAAAAA] hover:text-white transition-colors" title="编辑"><Edit size={14} /></button>
                      <button className="p-1.5 rounded-full hover:bg-[#EF4444]/20 text-[#AAAAAA] hover:text-[#EF4444] transition-colors" title="删除"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-[#AAAAAA]">
        <span>共 {totalPages * 20} 条</span>
        <div className="flex gap-2">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-full ${page === i + 1 ? 'bg-[#6366F1] text-white' : 'hover:bg-[#272727]'}`}>{i + 1}</button>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingMovie ? '编辑影视' : '新增影视'} maxWidth="max-w-2xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-[#AAAAAA]">标题 *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
            <div><label className="text-xs text-[#AAAAAA]">类型 *</label><select value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm"><option value="">选择类型</option><option>剧情</option><option>科幻</option><option>动作</option><option>喜剧</option><option>爱情</option><option>悬疑</option><option>动画</option><option>恐怖</option></select></div>
            <div><label className="text-xs text-[#AAAAAA]">评分</label><input type="number" step="0.1" min="0" max="10" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
            <div><label className="text-xs text-[#AAAAAA]">年份</label><input value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
            <div><label className="text-xs text-[#AAAAAA]">导演</label><input value={form.director} onChange={e => setForm({...form, director: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
            <div><label className="text-xs text-[#AAAAAA]">时长(分钟)</label><input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full mt-1 h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm" /></div>
          </div>
          <div><label className="text-xs text-[#AAAAAA]">简介</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full mt-1 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 py-2 text-white text-sm resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-full bg-[#303030] text-white px-6 py-2 text-sm hover:bg-[#3F3F3F] transition-colors">取消</button>
            <button onClick={handleSave} className="rounded-full bg-[#6366F1] text-white px-6 py-2 text-sm hover:bg-[#4F46E5] transition-colors">保存</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
