'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crown, Sparkles, Zap, Check, Star, Download, ShieldCheck, HeartHandshake, Film, Clock, MonitorPlay, Headphones, Infinity } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { GENRES } from '@/lib/constants';

const TIERS = [
  {
    key: 'VIP',
    name: 'VIP',
    subtitle: '畅享观影',
    price: '19.9',
    originalPrice: '29.9',
    color: '#F59E0B',
    bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
    border: 'border-amber-500/30',
    btnBg: 'bg-amber-500 hover:bg-amber-600',
    badge: '入门首选',
    icon: <Star size={22} strokeWidth={1.5} />,
    features: [
      { text: '1080P 高清画质', included: true },
      { text: '跳过片头广告', included: true },
      { text: '单设备观看', included: true },
      { text: '每月 5 次 AI 对话', included: true },
      { text: '收藏上限 50 部', included: true },
      { text: '4K 超清画质', included: false },
      { text: '杜比全景声', included: false },
      { text: '多设备同时观看', included: false },
      { text: '无限 AI 对话', included: false },
      { text: '专属客服', included: false },
    ],
  },
  {
    key: 'VVIP',
    name: 'VVIP',
    subtitle: '进阶体验',
    price: '39.9',
    originalPrice: '59.9',
    color: '#6366F1',
    bg: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    border: 'border-indigo-500/30',
    btnBg: 'bg-indigo-500 hover:bg-indigo-600',
    badge: '最受欢迎',
    popular: true,
    icon: <Zap size={22} strokeWidth={1.5} />,
    features: [
      { text: '1080P 高清画质', included: true },
      { text: '跳过片头广告', included: true },
      { text: '两台设备同时观看', included: true },
      { text: '每月 50 次 AI 对话', included: true },
      { text: '收藏上限 200 部', included: true },
      { text: '4K 超清画质', included: true },
      { text: '杜比全景声', included: false },
      { text: '下载离线观看', included: true },
      { text: '无限 AI 对话', included: false },
      { text: '专属客服', included: false },
    ],
  },
  {
    key: 'SVIP',
    name: 'Super VIP',
    subtitle: '至尊专享',
    price: '69.9',
    originalPrice: '99.9',
    color: '#EF4444',
    bg: 'from-red-500/10 via-red-500/5 to-transparent',
    border: 'border-red-500/40',
    btnBg: 'bg-red-500 hover:bg-red-600',
    badge: '一步到位',
    icon: <Crown size={22} strokeWidth={1.5} />,
    features: [
      { text: '1080P 高清画质', included: true },
      { text: '全站无广告', included: true },
      { text: '四台设备同时观看', included: true },
      { text: '无限 AI 对话', included: true },
      { text: '无限收藏', included: true },
      { text: '4K 超清画质', included: true },
      { text: '杜比全景声', included: true },
      { text: '下载离线观看', included: true },
      { text: '至尊专属勋章', included: true },
      { text: '专属客服 24/7', included: true },
    ],
  },
];

function TierCard({ tier, currentVip, onSelect, selectedKey, confirming }) {
  const isCurrent = currentVip === tier.key;
  const isSelected = selectedKey === tier.key;

  return (
    <div
      className={`relative bg-[#212121] rounded-2xl border ${tier.border} overflow-hidden transition-all duration-300 flex flex-col ${
        tier.popular ? 'sm:scale-105 sm:shadow-2xl sm:shadow-indigo-500/10 z-10' : ''
      } ${isSelected ? 'ring-2 ring-white/20' : ''}`}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute top-0 right-0 bg-[#6366F1] text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
          最受欢迎
        </div>
      )}

      {/* Current badge */}
      {isCurrent && (
        <div className="absolute top-0 left-0 bg-[#10B981] text-white text-xs font-bold px-4 py-1 rounded-br-xl">
          当前套餐
        </div>
      )}

      <div className={`p-6 pb-4 bg-gradient-to-b ${tier.bg}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
            <span style={{ color: tier.color }}>{tier.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{tier.name}</h3>
            <p className="text-xs text-[#AAAAAA]">{tier.subtitle}</p>
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-sm text-[#AAAAAA]">¥</span>
          <span className="text-4xl font-bold text-white">{tier.price}</span>
          <span className="text-sm text-[#AAAAAA]">/月</span>
        </div>
        {tier.originalPrice && (
          <p className="text-xs text-[#717171] line-through mt-0.5">¥{tier.originalPrice}/月</p>
        )}
      </div>

      {/* Feature list */}
      <div className="p-6 pt-4 flex-1">
        <p className="text-xs font-medium text-[#AAAAAA] mb-3 uppercase tracking-wider">套餐权益</p>
        <ul className="space-y-2.5">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2.5">
              <Check
                size={16}
                strokeWidth={2.5}
                className={`shrink-0 ${f.included ? 'text-[#10B981]' : 'text-[#3F3F3F]'}`}
              />
              <span className={`text-sm ${f.included ? 'text-white' : 'text-[#555] line-through'}`}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <div className="px-6 pb-6">
        {isCurrent ? (
          <button
            disabled
            className="w-full h-12 rounded-full bg-[#303030] text-[#717171] text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check size={18} strokeWidth={2} /> 当前套餐
          </button>
        ) : (
          <button
            onClick={() => onSelect(tier.key)}
            disabled={confirming}
            className={`w-full h-12 rounded-full text-white text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              isSelected
                ? `${tier.btnBg} ring-2 ring-white/20`
                : 'bg-[#303030] hover:bg-[#3F3F3F]'
            }`}
          >
            {isSelected ? (
              confirming ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>确认支付 ¥{tier.price} <Sparkles size={16} /></>
              )
            ) : (
              isCurrent ? '当前套餐' : `开通 ${tier.name}`
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MembershipPage() {
  const { user, vipLevel, upgradeVip, isAdmin } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelect = useCallback((key) => {
    setSelectedTier(key);
  }, []);

  // Click again to confirm
  const handleConfirm = useCallback(async (key) => {
    if (selectedTier !== key) {
      setSelectedTier(key);
      return;
    }
    // Confirm payment
    setConfirming(true);
    await new Promise(r => setTimeout(r, 1500));
    upgradeVip(key);
    setConfirming(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [selectedTier, upgradeVip]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const currentTier = TIERS.find(t => t.key === vipLevel);

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} genres={GENRES} isAdmin={isAdmin} />

        <main className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'}`}>
          <div className="max-w-[1100px] mx-auto px-6 py-8">
            {/* Back */}
            <Link
              href="/profile"
              title="返回个人中心"
              className="inline-flex items-center gap-1.5 text-sm text-[#AAAAAA] hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)] hover:bg-[#272727]"
            >
              ← 返回个人中心
            </Link>

            {/* Header */}
            <div className="mt-4 mb-2 text-center">
              <h1 className="text-3xl font-bold text-white">升级会员</h1>
              <p className="text-sm text-[#AAAAAA] mt-2">解锁更多权益，畅享极致观影体验</p>
            </div>

            {/* Current status */}
            {vipLevel && (
              <div
                className="mt-6 mb-8 max-w-md mx-auto rounded-full px-5 py-2.5 flex items-center justify-center gap-3 text-sm font-medium"
                style={{
                  backgroundColor: `${currentTier?.color || '#717171'}15`,
                  border: `1px solid ${currentTier?.color || '#717171'}30`,
                  color: currentTier?.color || '#AAAAAA',
                }}
              >
                <Crown size={18} strokeWidth={1.5} />
                您当前是 <span className="font-bold">{currentTier?.name || vipLevel}</span> 会员
              </div>
            )}

            {/* Tier cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-[1000px] mx-auto">
              {TIERS.map(tier => (
                <button
                  key={tier.key}
                  onClick={() => handleConfirm(tier.key)}
                  className="text-left w-full"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  <TierCard
                    tier={tier}
                    currentVip={vipLevel}
                    onSelect={handleSelect}
                    selectedKey={selectedTier}
                    confirming={confirming && selectedTier === tier.key}
                  />
                </button>
              ))}
            </div>

            {/* Bottom perks */}
            <div className="mt-16 max-w-[900px] mx-auto">
              <h3 className="text-lg font-bold text-white text-center mb-8">所有会员均享</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { icon: <Film size={22} />, label: '海量片库' },
                  { icon: <MonitorPlay size={22} />, label: '多端观看' },
                  { icon: <Download size={22} />, label: '离线下载' },
                  { icon: <Headphones size={22} />, label: '杜比音效' },
                  { icon: <Infinity size={22} />, label: '无限续期' },
                  { icon: <ShieldCheck size={22} />, label: '安全支付' },
                ].map((p, i) => (
                  <div key={i} className="bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 text-center hover:border-[rgba(255,255,255,0.12)] transition-colors">
                    <div className="text-[#6366F1] mb-2 flex justify-center">{p.icon}</div>
                    <p className="text-xs text-[#AAAAAA]">{p.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-[#555] mt-12">
              首次开通享 7 天免费试用 · 随时可取消 · 自动续费可关闭
            </p>
          </div>
        </main>
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#10B981] text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium animate-slide-up flex items-center gap-2">
          <Sparkles size={18} />
          升级成功！您现在是 {TIERS.find(t => t.key === vipLevel)?.name} 会员了 🎉
        </div>
      )}
    </div>
  );
}
