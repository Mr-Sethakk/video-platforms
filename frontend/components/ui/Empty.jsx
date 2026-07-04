'use client';

import { Film } from 'lucide-react';

export default function Empty({
  icon,
  title = 'No content found',
  description = '',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="text-[#AAAAAA] mb-4">
        {icon || <Film size={48} strokeWidth={1.5} />}
      </div>

      {/* Title */}
      {title && (
        <h3 className="text-white/80 text-lg font-medium mb-1">{title}</h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-[#AAAAAA] text-sm max-w-sm mb-6">{description}</p>
      )}

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-full bg-white text-black px-6 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
