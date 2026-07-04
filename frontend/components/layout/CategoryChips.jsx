'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

export default function CategoryChips({ items = [], active = '', onChange }) {
  const scrollRef = useRef(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftGradient(el.scrollLeft > 2);
    setShowRightGradient(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const handleChipClick = useCallback(
    (value) => {
      if (onChange) onChange(value);
    },
    [onChange]
  );

  return (
    <div className="relative">
      {/* Left gradient fade */}
      {showLeftGradient && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[#0F0F0F] to-transparent" />
      )}

      {/* Right gradient fade */}
      {showRightGradient && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[#0F0F0F] to-transparent" />
      )}

      {/* Scrollable chip container */}
      <div
        ref={scrollRef}
        className="flex gap-3 px-6 overflow-x-auto whitespace-nowrap h-14 items-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Always render "全部" as the first chip */}
        <button
          type="button"
          onClick={() => handleChipClick('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            active === ''
              ? 'bg-white text-[#0F0F0F] font-semibold'
              : 'bg-[#303030] text-white hover:bg-[#3F3F3F]'
          }`}
        >
          全部
        </button>

        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => handleChipClick(item.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              active === item.value
                ? 'bg-white text-[#0F0F0F] font-semibold'
                : 'bg-[#303030] text-white hover:bg-[#3F3F3F]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
