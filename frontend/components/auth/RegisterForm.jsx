'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function RegisterForm({ onSubmit, loading, error }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (loading) return;

    // Validate passwords match
    if (password !== confirmPassword) {
      setValidationError('两次输入的密码不一致');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setValidationError('密码长度至少6位');
      return;
    }

    onSubmit({ username, email, password });
  };

  const displayError = validationError || error;

  return (
    <div className="bg-[#212121] rounded-2xl p-8 w-[400px] max-w-[90vw] border border-[rgba(255,255,255,0.06)]">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-[#303030] flex items-center justify-center mb-3">
          <UserPlus size={24} strokeWidth={1.5} className="text-[#6366F1]" />
        </div>
        <h1 className="text-xl font-bold text-white">注册</h1>
      </div>

      {/* Error message */}
      {displayError && (
        <p className="text-sm text-[#EF4444] mb-4 text-center">{displayError}</p>
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

        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="请输入邮箱"
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
          className="w-full bg-[#0F0F0F] border border-[#303030] rounded-lg h-12 px-4 text-white placeholder:text-[#717171] focus:border-[#6366F1] focus:outline-none mb-4 transition-colors"
        />

        {/* Confirm Password */}
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="请再次输入密码"
          disabled={loading}
          className="w-full bg-[#0F0F0F] border border-[#303030] rounded-lg h-12 px-4 text-white placeholder:text-[#717171] focus:border-[#6366F1] focus:outline-none mb-6 transition-colors"
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#6366F1] h-12 font-medium text-white hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '注册中...' : '注 册'}
        </button>
      </form>

      {/* Bottom link */}
      <p className="text-sm text-[#AAAAAA] text-center mt-4">
        已有账号？{' '}
        <Link href="/login" className="text-[#6366F1] hover:text-[#4F46E5] transition-colors">
          立即登录
        </Link>
      </p>
    </div>
  );
}
