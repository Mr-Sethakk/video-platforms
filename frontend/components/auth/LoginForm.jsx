'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function LoginForm({ onSubmit, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    onSubmit({ username, password });
  };

  return (
    <div className="bg-[#212121] rounded-2xl p-8 w-[400px] max-w-[90vw] border border-[rgba(255,255,255,0.06)]">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-[#303030] flex items-center justify-center mb-3">
          <Lock size={24} strokeWidth={1.5} className="text-[#6366F1]" />
        </div>
        <h1 className="text-xl font-bold text-white">登录</h1>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#EF4444] mb-4 text-center">{error}</p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Username */}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
          disabled={loading}
          className="w-full bg-[#0F0F0F] border border-[#303030] rounded-lg h-12 px-4 text-white placeholder:text-[#717171] focus:border-[#6366F1] focus:outline-none mb-4 transition-colors"
        />

        {/* Password */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
          disabled={loading}
          className="w-full bg-[#0F0F0F] border border-[#303030] rounded-lg h-12 px-4 text-white placeholder:text-[#717171] focus:border-[#6366F1] focus:outline-none mb-6 transition-colors"
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#6366F1] h-12 font-medium text-white hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '登录中...' : '登 录'}
        </button>
      </form>

      {/* Bottom link */}
      <p className="text-sm text-[#AAAAAA] text-center mt-4">
        还没有账号？{' '}
        <Link href="/register" className="text-[#6366F1] hover:text-[#4F46E5] transition-colors">
          立即注册
        </Link>
      </p>
    </div>
  );
}
