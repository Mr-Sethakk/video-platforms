'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Heart } from 'lucide-react';

export default function MovieCard({
  movie,
  variant = 'grid',
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist = false,
}) {
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist) {
      onRemoveFromWatchlist?.(movie.id);
    } else {
      onAddToWatchlist?.(movie.id);
    }
  };

  const posterContent = movie.posterUrl && !imgError ? (
    <img
      src={movie.posterUrl}
      alt={movie.title}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => setImgError(true)}
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-[#6366F1]/30 to-[#6366F1]/10" />
  );

  if (variant === 'horizontal') {
    return (
      <Link href={`/movies/${movie.id}`} className="block">
        <div className="flex gap-3 p-2 rounded-xl hover:bg-[#272727] cursor-pointer group">
          {/* Thumbnail */}
          <div className="w-[168px] h-[94px] rounded-lg overflow-hidden flex-shrink-0 bg-[#212121]">
            {movie.posterUrl && !imgError ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#6366F1]/30 to-[#6366F1]/10" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-[#6366F1] transition-colors">
              {movie.title}
            </h3>
            <p className="text-xs text-[#AAAAAA] mt-1">
              ⭐ {movie.rating} · {movie.director}
            </p>
            <p className="text-xs text-[#AAAAAA]">
              {movie.duration ? `${movie.duration}分钟 · ` : ''}{movie.year}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // variant === 'grid'
  return (
    <Link href={`/movies/${movie.id}`} className="block">
      <div className="rounded-xl overflow-hidden group cursor-pointer">
        {/* Poster container */}
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#212121]">
          <div className="w-full h-full group-hover:brightness-75 transition-all duration-200">
            {posterContent}
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 text-white bg-black/50 rounded-full p-2 flex items-center justify-center">
              <Play size={24} strokeWidth={1.5} fill="white" />
            </div>
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <Heart
              size={16}
              strokeWidth={1.5}
              fill={isInWatchlist ? '#EF4444' : 'none'}
              color={isInWatchlist ? '#EF4444' : 'white'}
            />
          </button>

          {/* Rating badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-bold flex items-center gap-1 text-white">
            <span className="text-[#F59E0B]">⭐</span>
            {movie.rating}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-white leading-5 line-clamp-2 mt-2 group-hover:text-[#6366F1] transition-colors">
          {movie.title}
        </h3>

        {/* Meta line 1: director + year */}
        <p className="text-xs text-[#AAAAAA] mt-1">
          {movie.director ? `${movie.director} · ` : ''}{movie.year}
        </p>

        {/* Meta line 2: duration + genre */}
        {movie.duration && (
          <p className="text-xs text-[#AAAAAA]">
            {movie.duration}分钟 · {movie.genre}
          </p>
        )}
      </div>
    </Link>
  );
}
