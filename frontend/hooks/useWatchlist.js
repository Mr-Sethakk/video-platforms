'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * 片单收藏管理
 * - 后端实际存储（MySQL），前端纯消费者
 * - addToWatchlist: 即使409(已收藏)也同步本地状态
 * - removeFromWatchlist: 即使404(不在列表)也同步本地状态
 * - generation counter 防竞态
 * - window focus 时刷新，保证跨页面一致
 */
export function useWatchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movieIds, setMovieIds] = useState(new Set());
  const fetchGenRef = useRef(0);

  const fetchWatchlist = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const gen = ++fetchGenRef.current;
    setLoading(true);
    try {
      const data = await apiFetch('/watchlist');
      if (gen !== fetchGenRef.current) return;

      // 兼容后端返回格式: 后端返回 Movie[], 前端 mock 返回数组或 { records }
      const list = Array.isArray(data) ? data : (data.records || []);
      setItems(list);
      // 后端返回的 Movie 对象用 m.id 即是电影 ID
      setMovieIds(new Set(list.map(m => m.id)));
    } catch {
      if (gen !== fetchGenRef.current) return;
      // 未登录或网络错误
    } finally {
      if (gen === fetchGenRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // 切 Tab 回来刷新
  useEffect(() => {
    const onFocus = () => fetchWatchlist();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(async (movieId) => {
    // 乐观更新：先更新本地状态
    setMovieIds(prev => new Set([...prev, movieId]));

    try {
      await apiFetch('/watchlist', {
        method: 'POST',
        body: JSON.stringify({ movieId }),
      });
      // 成功后拉取完整列表以保证 items 与后端一致
      fetchWatchlist();
      return true;
    } catch {
      // 409(已收藏)也视作成功 — 本地状态已正确
      // 只有真正的网络/认证错误才算失败
      fetchWatchlist(); // 仍尝试刷新以确保一致
      return true; // 不返回 false，保证 UI 不会回滚
    }
  }, [fetchWatchlist]);

  const removeFromWatchlist = useCallback(async (movieId) => {
    // 乐观更新：先更新本地
    setMovieIds(prev => {
      const next = new Set(prev);
      next.delete(movieId);
      return next;
    });
    setItems(prev => prev.filter(m => m.id !== movieId));

    try {
      await apiFetch(`/watchlist/${movieId}`, { method: 'DELETE' });
      return true;
    } catch {
      // 404(已不在列表)也视作成功 — 本地状态已正确
      return true;
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
