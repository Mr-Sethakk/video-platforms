'use client';
import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * 片单收藏管理
 */
export function useWatchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movieIds, setMovieIds] = useState(new Set());

  const fetchWatchlist = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch('/watchlist');
      setItems(data.records || data || []);
      setMovieIds(new Set((data.records || data || []).map(m => m.id)));
    } catch {
      // 未登录时静默失败
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(async (movieId) => {
    try {
      await apiFetch('/watchlist', {
        method: 'POST',
        body: JSON.stringify({ movieId }),
      });
      setMovieIds(prev => new Set([...prev, movieId]));
      return true;
    } catch {
      return false;
    }
  }, []);

  const removeFromWatchlist = useCallback(async (movieId) => {
    try {
      await apiFetch(`/watchlist/${movieId}`, { method: 'DELETE' });
      setMovieIds(prev => {
        const next = new Set(prev);
        next.delete(movieId);
        return next;
      });
      setItems(prev => prev.filter(m => m.id !== movieId));
      return true;
    } catch {
      return false;
    }
  }, []);

  const isInWatchlist = useCallback((movieId) => {
    return movieIds.has(movieId);
  }, [movieIds]);

  return {
    items,
    loading,
    count: movieIds.size,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refresh: fetchWatchlist,
  };
}
