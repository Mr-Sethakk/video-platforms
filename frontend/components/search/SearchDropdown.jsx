'use client';
import { useState, useCallback } from 'react';
import { Clock, X, Search, Film, User, Tag, Calendar } from 'lucide-react';

const TYPE_ICONS = {
  '电影': Film,
  '导演': User,
  '类型': Tag,
  '年份': Calendar,
};

/**
 * 高亮匹配文本
 */
function HighlightText({ text, keyword }) {
  if (!keyword || !text) return text;

  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const idx = lowerText.indexOf(lowerKeyword);

  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + keyword.length);
  const after = text.slice(idx + keyword.length);

  return (
    <>
      {before}
      <span className="text-[#6366F1] font-medium">{match}</span>
      {after}
    </>
  );
}

/**
 * 确认清空弹窗（内联）
 */
function ClearConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="absolute inset-0 z-10 bg-[#212121] rounded-xl flex flex-col items-center justify-center p-6 gap-4">
      <p className="text-white text-sm font-medium">清空所有搜索历史？</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded-full text-sm text-[#AAAAAA] hover:text-white hover:bg-[#3F3F3F] transition-colors"
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-1.5 rounded-full text-sm bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors"
        >
          确认清空
        </button>
      </div>
    </div>
  );
}

/**
 * 搜索下拉面板
 * - 搜索历史（"最近搜索" + 清空 + 单条删除）
 * - 联想建议（高亮匹配 + 类型标签）
 * - 加载态 / 空状态
 */
export default function SearchDropdown({
  isOpen,
  history = [],
  suggestions = [],
  loading = false,
  searchQuery = '',
  onSelectSuggestion,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory,
  onClose,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleItemMouseDown = useCallback((e, callback) => {
    // 防止 blur 先触发导致下拉关闭
    e.preventDefault();
    callback?.();
  }, []);

  if (!isOpen) return null;

  const hasHistory = history.length > 0;
  const hasSuggestions = suggestions.length > 0;
  const showDivider = hasHistory && (hasSuggestions || loading);

  // 提取用于高亮的纯关键词（过滤特殊字符后取第一个词）
  const highlightKeyword = searchQuery
    .replace(/[^一-龥a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s/)[0] || '';

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 bg-[#212121] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* ========== 搜索历史区域 ========== */}
      {hasHistory && (
        <div className="relative">
          {/* 确认清空弹窗 */}
          {showClearConfirm && (
            <ClearConfirmDialog
              onConfirm={() => {
                onClearHistory?.();
                setShowClearConfirm(false);
              }}
              onCancel={() => setShowClearConfirm(false)}
            />
          )}

          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-xs text-[#AAAAAA] font-medium flex items-center gap-1.5">
              <Clock size={14} strokeWidth={1.5} />
              最近搜索
            </span>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-[#717171] hover:text-[#EF4444] transition-colors"
            >
              清空
            </button>
          </div>

          <div className="px-2 pb-1">
            {history.map((item) => (
              <div
                key={item.keyword}
                className="flex items-center group rounded-lg hover:bg-[#303030] transition-colors"
              >
                <button
                  onMouseDown={(e) =>
                    handleItemMouseDown(e, () => onSelectHistory?.(item.keyword))
                  }
                  className="flex-1 flex items-center gap-3 px-2 py-2 text-left min-w-0"
                >
                  <Clock size={16} strokeWidth={1.5} className="text-[#717171] shrink-0" />
                  <span className="text-sm text-[#CCCCCC] truncate">
                    {item.keyword}
                  </span>
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteHistory?.(item.keyword);
                  }}
                  className="p-2 text-[#717171] hover:text-white opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  aria-label={`删除 "${item.keyword}"`}
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分隔线 */}
      {showDivider && (
        <div className="mx-4 border-t border-[rgba(255,255,255,0.06)]" />
      )}

      {/* ========== 联想建议区域 ========== */}
      {(hasSuggestions || loading) && (
        <div className="px-2 py-1">
          {loading ? (
            /* 加载态 */
            <div className="px-2 py-3 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-[#717171]">搜索中...</span>
            </div>
          ) : (
            suggestions.map((movie) => {
              const primaryType = movie.matchTypes?.[0] || '电影';
              const TypeIcon = TYPE_ICONS[primaryType] || Film;

              return (
                <button
                  key={movie.id}
                  onMouseDown={(e) =>
                    handleItemMouseDown(e, () => onSelectSuggestion?.(movie))
                  }
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#303030] transition-colors text-left group"
                >
                  {/* 电影海报缩略图 */}
                  <div className="w-10 h-14 rounded overflow-hidden bg-[#0F0F0F] shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-[#6366F1]/20 to-[#6366F1]/5 flex items-center justify-center">
                      <Film size={14} strokeWidth={1.5} className="text-[#6366F1]/50" />
                    </div>
                  </div>

                  {/* 信息区 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-1 group-hover:text-[#6366F1] transition-colors">
                      <HighlightText text={movie.title} keyword={highlightKeyword} />
                    </p>
                    <p className="text-xs text-[#AAAAAA] mt-0.5 line-clamp-1">
                      <HighlightText
                        text={`${movie.director || ''} · ${movie.year}`}
                        keyword={highlightKeyword}
                      />
                    </p>
                  </div>

                  {/* 类型标签 */}
                  <div className="flex items-center gap-1 shrink-0">
                    {movie.matchTypes?.slice(0, 2).map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[#6366F1]/20 text-[#6366F1]"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* 评分 */}
                  <span className="text-xs text-[#F59E0B] font-medium shrink-0 w-8 text-right">
                    {movie.rating}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* ========== 联想无结果 ========== */}
      {!loading && !hasSuggestions && searchQuery.trim() && (
        <div className="px-4 py-6 text-center">
          <Search size={24} strokeWidth={1.5} className="text-[#717171] mx-auto mb-2" />
          <p className="text-sm text-[#AAAAAA]">暂无匹配的影片或影人</p>
        </div>
      )}

      {/* ========== 空历史 + 无输入 ========== */}
      {!hasHistory && !searchQuery.trim() && (
        <div className="px-4 py-6 text-center">
          <Search size={24} strokeWidth={1.5} className="text-[#717171] mx-auto mb-2" />
          <p className="text-sm text-[#AAAAAA]">搜索电影、导演、演员...</p>
        </div>
      )}
    </div>
  );
}
