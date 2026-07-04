'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import RegisterForm from '@/components/auth/RegisterForm'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = useCallback(
    async ({ username, password, email }) => {
      setLoading(true)
      setError(null)
      try {
        await register(username, password, email)
        router.push('/login')
      } catch (e) {
        setError(e.message || '注册失败，请重试')
      } finally {
        setLoading(false)
      }
    },
    [register, router]
  )

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">🎬 电影APP</h1>
          <p className="text-sm text-[#AAAAAA] mt-1">创建新账号</p>
        </div>

        {/* Register form */}
        <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  )
}
