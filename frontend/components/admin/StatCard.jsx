'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_MAP = {
  brand: '#6366F1',
  warning: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
};

export default function StatCard({ icon, title, value, change, color = 'brand' }) {
  const accentColor = COLOR_MAP[color] || COLOR_MAP.brand;
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="bg-[#212121] rounded-xl p-6 border border-[rgba(255,255,255,0.06)]">
      {/* Icon */}
      <div className="text-[#AAAAAA]" style={{ color: accentColor }}>
        {icon}
      </div>

      {/* Title */}
      <p className="text-sm text-[#AAAAAA] mt-2">{title}</p>

      {/* Value */}
      <p className="text-3xl font-bold text-white mt-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>

      {/* Change badge */}
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive ? (
            <TrendingUp size={14} strokeWidth={1.5} className="text-[#10B981]" />
          ) : (
            <TrendingDown size={14} strokeWidth={1.5} className="text-[#EF4444]" />
          )}
          <span
            className={`text-xs ${
              isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}
          >
            {isPositive ? '+' : ''}
            {change}%
          </span>
        </div>
      )}
    </div>
  );
}
