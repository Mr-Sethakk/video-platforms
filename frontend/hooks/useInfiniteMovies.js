'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * 无限滚动加载电影列表
 * @param {Object} params - 查询参数 { genre, sort, search, pageSize }
 */
export function useInfiniteMovies(params = {}) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);

  // 当筛选条件变化时重置
  useEffect(() => {
    const prev = paramsRef.current;
    if (prev.genre !== params.genre || prev.sort !== params.sort || prev.search !== params.search) {
      setMovies([]);
      setPage(1);
      setHasMore(true);
    }
    paramsRef.current = params;
  }, [params.genre, params.sort, params.search]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('pageSize', String(params.pageSize || 24));
      if (params.genre) query.set('genre', params.genre);
      if (params.sort) query.set('sort', params.sort);
      if (params.search) query.set('q', params.search);

      const data = await apiFetch(`/movies?${query.toString()}`);
      setMovies(prev => [...prev, ...data.records]);
      setHasMore(data.page < data.totalPages);
      setPage(p => p + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, params]);

  // 初始加载
  useEffect(() => {
    if (movies.length === 0 && hasMore && !loading) {
      loadMore();
    }
  }, []);

  return { movies, loading, hasMore, error, loadMore, setMovies };
}
