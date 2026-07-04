'use client';

import { Play } from 'lucide-react';

export default function VideoReviewCard({ video, onApprove, onReject, onSkip }) {
  const {
    title = '未命名视频',
    description = '',
    uploader = '未知用户',
    time = '',
    tags = [],
    thumbnailUrl,
  } = video || {};

  return (
    <div className="bg-[#212121] rounded-xl p-4 border border-[rgba(255,255,255,0.06)] flex gap-4">
      {/* Left: Thumbnail */}
      <div className="w-[200px] aspect-video rounded-lg bg-[#0F0F0F] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Play size={32} strokeWidth={1.5} className="text-[#717171]" />
        )}
      </div>

      {/* Right: Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-base font-medium text-white truncate">{title}</h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-[#AAAAAA] line-clamp-2 mt-1">
              {description}
            </p>
          )}

          {/* Meta */}
          <div className="text-xs text-[#717171] mt-2">
            {uploader}
            {time && (
              <>
                <span className="mx-1">·</span>
                {time}
              </>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-[#303030] px-2 py-0.5 text-xs text-[#AAAAAA]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => onApprove?.(video)}
            className="rounded-full bg-[#10B981] text-white px-6 py-2 text-sm font-medium hover:bg-[#059669] transition-colors"
          >
            通过
          </button>
          <button
            type="button"
            onClick={() => onReject?.(video)}
            className="rounded-full bg-[#EF4444] text-white px-6 py-2 text-sm font-medium hover:bg-[#DC2626] transition-colors"
          >
            拒绝
          </button>
          <button
            type="button"
            onClick={() => onSkip?.(video)}
            className="rounded-full bg-[#303030] text-white px-6 py-2 text-sm font-medium hover:bg-[#3F3F3F] transition-colors"
          >
            跳过
          </button>
        </div>
      </div>
    </div>
  );
}
