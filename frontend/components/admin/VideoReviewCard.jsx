'use client';

import { useState } from 'react';
import { Play, Film, Clock, HardDrive, Monitor } from 'lucide-react';

export default function VideoReviewCard({ video, onApprove, onReject, onSkip }) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const {
    title = '未命名视频',
    description = '',
    uploader = '未知用户',
    time = '',
    tags = [],
    duration,
    fileSize,
    format,
  } = video || {};

  const handleApprove = async () => {
    setApproving(true);
    try { await onApprove?.(video); } finally { setApproving(false); }
  };

  const handleReject = async () => {
    setRejecting(true);
    try { await onReject?.(video); } finally { setRejecting(false); }
  };

  return (
    <div className="bg-[#212121] rounded-xl p-4 border border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row gap-4 hover:border-[rgba(255,255,255,0.12)] transition-colors">
      {/* Left: Thumbnail placeholder */}
      <div className="w-full sm:w-[200px] aspect-video rounded-lg bg-[#0F0F0F] flex items-center justify-center flex-shrink-0 overflow-hidden relative group">
        <div className="flex flex-col items-center gap-1 text-[#717171] group-hover:text-[#6366F1] transition-colors">
          <Film size={32} strokeWidth={1.5} />
          <span className="text-[10px]">待审核</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <Play size={32} strokeWidth={1.5} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
        </div>
      </div>

      {/* Right: Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Title + meta row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-medium text-white truncate">{title}</h3>
            {fileSize && (
              <span className="text-xs text-[#717171] bg-[#0F0F0F] rounded-full px-2 py-0.5 shrink-0">{fileSize}</span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-[#AAAAAA] line-clamp-2 mt-1.5 leading-relaxed">
              {description}
            </p>
          )}

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#717171]">
            <span>{uploader}</span>
            {time && (
              <>
                <span className="text-[#444]">·</span>
                <span>{time}</span>
              </>
            )}
            {duration && (
              <>
                <span className="text-[#444]">·</span>
                <span className="flex items-center gap-1"><Clock size={11} />{duration}</span>
              </>
            )}
            {format && (
              <>
                <span className="text-[#444]">·</span>
                <span className="flex items-center gap-1"><Monitor size={11} />{format}</span>
              </>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag, idx) => (
                <span key={idx} className="rounded-full bg-[#272727] border border-[rgba(255,255,255,0.06)] px-2.5 py-0.5 text-xs text-[#AAAAAA]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5 mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
          <button
            disabled={approving}
            onClick={handleApprove}
            className="rounded-full bg-[#10B981] text-white px-5 py-2 text-sm font-medium hover:bg-[#059669] disabled:opacity-50 transition-colors"
          >
            {approving ? '处理中...' : '✅ 通过'}
          </button>
          <button
            disabled={rejecting}
            onClick={handleReject}
            className="rounded-full bg-[#EF4444] text-white px-5 py-2 text-sm font-medium hover:bg-[#DC2626] disabled:opacity-50 transition-colors"
          >
            {rejecting ? '处理中...' : '❌ 拒绝'}
          </button>
          <button
            onClick={() => onSkip?.(video)}
            className="rounded-full bg-[#303030] text-white px-5 py-2 text-sm font-medium hover:bg-[#3F3F3F] transition-colors ml-auto"
          >
            ⏭ 跳过
          </button>
        </div>
      </div>
    </div>
  );
}
