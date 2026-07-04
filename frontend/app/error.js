'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <div className="text-center px-4">
        {/* Error icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-2">出了点问题</h2>

        {/* Error message */}
        <p className="text-sm text-[#AAAAAA] mb-6 max-w-md">
          {error?.message || '页面加载失败，请稍后重试'}
        </p>

        {/* Retry button */}
        <button
          onClick={() => reset()}
          className="rounded-full bg-[#6366F1] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4F46E5] transition-colors"
        >
          重试
        </button>

        {/* Home link */}
        <a
          href="/"
          className="block mt-4 text-sm text-[#AAAAAA] hover:text-white transition-colors underline underline-offset-2"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}
