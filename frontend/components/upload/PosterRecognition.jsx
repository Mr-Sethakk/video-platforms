'use client';

import { useState } from 'react';
import { Star, Clock, User, Film } from 'lucide-react';
import ImageUpload from '@/components/upload/ImageUpload';

export default function PosterRecognition() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Build form data for API call
      const formData = new FormData();
      formData.append('poster', file);

      const response = await fetch('/api/poster-recognition', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('识别失败，请重试');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || '识别失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!result) return;
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie: result }),
      });

      if (!response.ok) {
        throw new Error('添加失败');
      }

      // Could show success toast here
    } catch (err) {
      setError(err.message || '添加到片单失败');
    }
  };

  return (
    <div>
      {/* Upload section */}
      <ImageUpload onUpload={handleUpload} accept="image/*" maxSize={5242880} />

      {/* Loading state */}
      {loading && (
        <div className="bg-[#212121] rounded-xl p-6 mt-4 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#AAAAAA]">正在识别海报...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-[#212121] rounded-xl p-4 mt-4">
          <p className="text-sm text-[#EF4444] text-center">{error}</p>
        </div>
      )}

      {/* Result card */}
      {result && !loading && (
        <div className="bg-[#212121] rounded-xl p-4 mt-4">
          <div className="flex gap-4">
            {/* Poster thumbnail */}
            <div className="flex-shrink-0">
              {result.poster ? (
                <img
                  src={result.poster}
                  alt={result.title}
                  className="w-24 h-36 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-36 bg-[#0F0F0F] rounded-lg flex items-center justify-center">
                  <Film size={24} strokeWidth={1.5} className="text-[#717171]" />
                </div>
              )}
            </div>

            {/* Movie info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate">
                {result.title || '未知影片'}
              </h3>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-2 text-xs text-[#AAAAAA]">
                {result.year && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} strokeWidth={1.5} />
                    {result.year}
                  </span>
                )}
                {result.director && (
                  <span className="flex items-center gap-1">
                    <User size={12} strokeWidth={1.5} />
                    {result.director}
                  </span>
                )}
                {result.rating && (
                  <span className="flex items-center gap-1 text-[#F59E0B]">
                    <Star size={12} strokeWidth={1.5} className="fill-[#F59E0B]" />
                    {result.rating}
                  </span>
                )}
              </div>

              {/* Description */}
              {result.description && (
                <p className="text-sm text-[#AAAAAA] mt-3 line-clamp-3">
                  {result.description}
                </p>
              )}

              {/* Add to watchlist button */}
              <button
                type="button"
                onClick={handleAddToWatchlist}
                className="mt-4 rounded-full bg-[#6366F1] text-white px-6 py-2 text-sm font-medium hover:bg-[#4F46E5] transition-colors"
              >
                添加到片单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
