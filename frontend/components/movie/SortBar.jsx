'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'default', label: '默认排序' },
  { key: 'rating', label: '评分最高' },
  { key: 'year', label: '最新上映' },
];

export default function SortBar({
  currentSort = 'default',
  onSortChange,
  title = '电影列表',
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.key === currentSort)?.label || '默认排序';

  const handleSelect = (key) => {
    setOpen(false);
    onSortChange?.(key);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-3">
      {/* Title */}
      <h1 className="text-xl font-bold text-white">{title}</h1>

      {/* Sort dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="bg-[#303030] rounded-full px-4 py-1.5 text-sm text-white flex items-center gap-2 hover:bg-[#3F3F3F] transition-colors"
        >
          {currentLabel}
          <ChevronDown size={16} strokeWidth={1.5} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 bg-[#212121] rounded-xl border border-[#303030] shadow-2xl z-30 py-1 min-w-[140px]">
            {SORT_OPTIONS.map((option) => (
              <div
                key={option.key}
                onClick={() => handleSelect(option.key)}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-[#272727] ${
                  currentSort === option.key
                    ? 'text-[#6366F1]'
                    : 'text-white'
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
