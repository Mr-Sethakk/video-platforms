'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, User as UserIcon } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { apiFetch } from '@/lib/api'

const STATUS_COLORS = { USER: '#10B981', ADMIN: '#6366F1' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: '20' })
      if (keyword) params.set('keyword', keyword)
      // Try real backend first, fallback to mock
      const data = await apiFetch(`/admin/users?${params}`)
      setUsers(data.records || [])
      setTotalPages(data.totalPages || 1)
    } catch {
      // Mock fallback
      const mock = [
        { id: 1, username: 'admin', email: 'admin@movie.com', role: 'ADMIN', createdAt: '2026-06-01' },
        { id: 2, username: 'user', email: 'user@movie.com', role: 'USER', createdAt: '2026-06-15' },
        { id: 3, username: 'zhangsan', email: 'zhangsan@qq.com', role: 'USER', createdAt: '2026-07-01' },
        { id: 4, username: 'lisi', email: 'lisi@163.com', role: 'USER', createdAt: '2026-07-03' },
        { id: 5, username: 'wangwu', email: 'wangwu@gmail.com', role: 'USER', createdAt: '2026-07-10' },
      ]
      setUsers(mock)
      setTotalPages(1)
    }
    finally { setLoading(false) }
  }, [keyword])

  useEffect(() => { fetchUsers(page) }, [page, fetchUsers])

  return (
    <AdminLayout title="👥 用户管理">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }} placeholder="搜索用户名/邮箱..." className="w-full h-10 rounded-full bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none pl-10 pr-4 text-white text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-[#717171] text-sm">加载中...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#AAAAAA] border-b border-[rgba(255,255,255,0.08)]">
                <th className="text-left py-3 px-4">用户</th>
                <th className="text-left py-3 px-4">邮箱</th>
                <th className="text-left py-3 px-4">角色</th>
                <th className="text-left py-3 px-4">注册时间</th>
                <th className="text-left py-3 px-4">状态</th>
                <th className="text-left py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[#272727] transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1] text-xs font-bold">
                        {u.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-white font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-[#AAAAAA]">{u.email}</td>
                  <td className="py-2.5 px-4">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: `${STATUS_COLORS[u.role] || '#717171'}20`, color: STATUS_COLORS[u.role] || '#717171' }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[#AAAAAA]">{u.createdAt}</td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span className="text-[#10B981]">正常</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <button className="text-sm text-[#6366F1] hover:underline">查看详情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-[#AAAAAA]">
        <span>共 {users.length} 条</span>
        <div className="flex gap-2">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-full ${page === i + 1 ? 'bg-[#6366F1] text-white' : 'hover:bg-[#272727]'}`}>{i + 1}</button>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
