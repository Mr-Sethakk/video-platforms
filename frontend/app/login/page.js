'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = useCallback(
    async ({ username, password }) => {
      setLoading(true)
      setError(null)
      try {
        await login(username, password)
        router.push('/')
      } catch (e) {
        setError(e.message || '登录失败，请重试')
      } finally {
        setLoading(false)
      }
    },
    [login, router]
  )

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">🎬 电影APP</h1>
          <p className="text-sm text-[#AAAAAA] mt-1">发现好电影</p>
        </div>

        {/* Login form */}
        <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  )
}
