'use client';

export default function Skeleton({ variant = 'grid' }) {
  const shimmer = 'bg-[#272727] animate-pulse rounded';

  if (variant === 'grid') {
    return (
      <div className="rounded-xl overflow-hidden">
        {/* Poster placeholder */}
        <div className={`aspect-[2/3] ${shimmer}`} />
        {/* Text lines */}
        <div className="mt-3 space-y-2 px-1">
          <div className={`h-4 w-3/4 ${shimmer}`} />
          <div className={`h-3 w-1/2 ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 rounded-xl overflow-hidden">
        {/* Thumbnail placeholder */}
        <div className={`w-[168px] h-[94px] flex-shrink-0 ${shimmer}`} />
        {/* Text lines */}
        <div className="flex-1 flex flex-col justify-center gap-2 py-2">
          <div className={`h-4 w-3/4 ${shimmer}`} />
          <div className={`h-3 w-1/2 ${shimmer}`} />
          <div className={`h-3 w-2/3 ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="rounded-xl overflow-hidden">
        {/* Large poster placeholder */}
        <div className={`h-80 w-full ${shimmer}`} />
        {/* Text lines */}
        <div className="mt-4 space-y-3 px-1">
          <div className={`h-6 w-2/3 ${shimmer}`} />
          <div className={`h-4 w-full ${shimmer}`} />
          <div className={`h-4 w-5/6 ${shimmer}`} />
          <div className={`h-3 w-1/2 ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-3">
        <div className={`h-4 w-3/4 ${shimmer}`} />
        <div className={`h-3 w-full ${shimmer}`} />
        <div className={`h-3 w-1/2 ${shimmer}`} />
      </div>
    );
  }

  return null;
}
