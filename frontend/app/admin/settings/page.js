'use client'

import { useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'

const STORAGE_KEY = 'admin_settings'

const TABS = [
  { key: 'basic', label: '基本设置' },
  { key: 'membership', label: '会员设置' },
  { key: 'payment', label: '支付设置' },
  { key: 'seo', label: 'SEO设置' },
]

const DEFAULT_SETTINGS = {
  basic: { siteName: '电影APP', siteDescription: '发现好电影', contactEmail: 'admin@movie.com', icpNumber: '京ICP备20240001号' },
  membership: { trialDays: '7', remindDays: '3', autoRenew: true },
  payment: { alipayAppId: '', wechatAppId: '', stripeKey: '' },
  seo: { seoTitle: '电影APP - 发现好电影', seoDescription: '在线观看高清电影，AI智能推荐', seoKeywords: '电影,在线观看,高清,AI推荐' },
}

function loadSettings() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS }
  catch { return DEFAULT_SETTINGS }
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('basic')
  const [settings, setSettings] = useState(loadSettings)
  const [saved, setSaved] = useState(false)

  const updateTab = (tabKey, updates) => {
    setSettings(prev => ({ ...prev, [tabKey]: { ...prev[tabKey], ...updates } }))
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const renderTab = () => {
    const s = settings[activeTab]
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-4">
            <SettingField label="站点名称" value={s.siteName} onChange={v => updateTab('basic', { siteName: v })} />
            <SettingField label="站点描述" value={s.siteDescription} onChange={v => updateTab('basic', { siteDescription: v })} />
            <SettingField label="联系邮箱" value={s.contactEmail} onChange={v => updateTab('basic', { contactEmail: v })} />
            <SettingField label="ICP备案号" value={s.icpNumber} onChange={v => updateTab('basic', { icpNumber: v })} />
          </div>
        )
      case 'membership':
        return (
          <div className="space-y-4">
            <SettingField label="试用天数" value={s.trialDays} onChange={v => updateTab('membership', { trialDays: v })} type="number" />
            <SettingField label="到期提醒天数" value={s.remindDays} onChange={v => updateTab('membership', { remindDays: v })} type="number" />
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#AAAAAA]">自动续费</label>
              <button onClick={() => updateTab('membership', { autoRenew: !s.autoRenew })} className={`relative w-12 h-6 rounded-full transition-colors ${s.autoRenew ? 'bg-[#6366F1]' : 'bg-[#303030]'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${s.autoRenew ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        )
      case 'payment':
        return (
          <div className="space-y-4">
            <SettingField label="支付宝 App ID" value={s.alipayAppId} onChange={v => updateTab('payment', { alipayAppId: v })} placeholder="暂未配置" />
            <SettingField label="微信支付 App ID" value={s.wechatAppId} onChange={v => updateTab('payment', { wechatAppId: v })} placeholder="暂未配置" />
            <SettingField label="Stripe Secret Key" value={s.stripeKey} onChange={v => updateTab('payment', { stripeKey: v })} placeholder="暂未配置" type="password" />
          </div>
        )
      case 'seo':
        return (
          <div className="space-y-4">
            <SettingField label="SEO 标题" value={s.seoTitle} onChange={v => updateTab('seo', { seoTitle: v })} />
            <SettingField label="SEO 描述" value={s.seoDescription} onChange={v => updateTab('seo', { seoDescription: v })} />
            <SettingField label="SEO 关键词" value={s.seoKeywords} onChange={v => updateTab('seo', { seoKeywords: v })} />
          </div>
        )
      default: return null
    }
  }

  return (
    <AdminLayout title="⚙️ 系统设置">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="flex lg:flex-col gap-1 lg:w-40 shrink-0">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${activeTab === tab.key ? 'bg-[#272727] text-white font-medium' : 'text-[#AAAAAA] hover:text-white hover:bg-[#272727]'}`}>{tab.label}</button>
          ))}
        </div>

        {/* Settings form */}
        <div className="flex-1 bg-[#212121] rounded-xl border border-[rgba(255,255,255,0.06)] p-6">
          <h3 className="text-base font-medium text-white mb-4">{TABS.find(t => t.key === activeTab)?.label}</h3>
          {renderTab()}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <button onClick={handleSave} className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${saved ? 'bg-[#10B981] text-white' : 'bg-[#6366F1] text-white hover:bg-[#4F46E5]'}`}>
              {saved ? '✓ 已保存' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

/** 内联设置字段组件 */
function SettingField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 items-start">
      <label className="text-sm text-[#AAAAAA] pt-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-lg bg-[#0F0F0F] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-3 text-white text-sm"
      />
    </div>
  )
}
