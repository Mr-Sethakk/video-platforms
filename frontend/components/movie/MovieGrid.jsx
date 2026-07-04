'use client';

import { useRef, useEffect, useCallback } from 'react';
import MovieCard from '@/components/movie/MovieCard';
import Skeleton from '@/components/ui/Skeleton';
import Empty from '@/components/ui/Empty';

export default function MovieGrid({
  movies = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  emptyMessage = '暂无电影',
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
}) {
  const sentinelRef = useRef(null);

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore?.();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '200px',
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect]);

  // Initial loading state
  if (loading && movies.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 gap-y-10 px-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4 mt-2 rounded" />
            <Skeleton className="h-3 w-1/2 mt-1 rounded" />
            <Skeleton className="h-3 w-2/3 mt-1 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!loading && movies.length === 0) {
    return (
      <div className="px-6 flex items-center justify-center min-h-[300px]">
        <Empty message={emptyMessage} />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 gap-y-10 px-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            variant="grid"
            onAddToWatchlist={onAddToWatchlist}
            onRemoveFromWatchlist={onRemoveFromWatchlist}
            isInWatchlist={isInWatchlist?.(movie.id) ?? false}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {loading && movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 gap-y-10 px-6 mt-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 mt-2 rounded" />
              <Skeleton className="h-3 w-1/2 mt-1 rounded" />
              <Skeleton className="h-3 w-2/3 mt-1 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      {hasMore && !loading && (
        <div ref={sentinelRef} className="h-4" />
      )}
    </div>
  );
}
