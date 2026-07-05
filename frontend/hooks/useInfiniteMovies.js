'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/api';

export function useInfiniteMovies(params = {}) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevParamsRef = useRef(null);

  const loadMore = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      query.set('page', String(currentPage));
      query.set('pageSize', String(params.pageSize || 24));
      if (params.genre) query.set('genre', params.genre);
      if (params.sort) query.set('sort', params.sort);
      if (params.search) query.set('q', params.search);

      const data = await apiFetch(`/movies?${query.toString()}`);
      if (currentPage === 1) {
        setMovies(data.records);
      } else {
        setMovies(prev => [...prev, ...data.records]);
      }
      setHasMore(data.page < data.totalPages);
      setPage(currentPage + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [params.genre, params.sort, params.search, params.pageSize]);

  // Reset + reload when filter params change
  useEffect(() => {
    const prev = prevParamsRef.current;
    const changed = !prev
      || prev.genre !== params.genre
      || prev.sort !== params.sort
      || prev.search !== params.search;

    if (changed) {
      setMovies([]);
      setPage(1);
      setHasMore(true);
      setError(null);
      loadMore(1);
    }
    prevParamsRef.current = { genre: params.genre, sort: params.sort, search: params.search };
  }, [params.genre, params.sort, params.search]);

  // Incremental load (page > 1, called by MovieGrid observer)
  const loadNextPage = useCallback(() => {
    if (!loading && hasMore) {
      loadMore(page);
    }
  }, [loading, hasMore, page, loadMore]);

  return { movies, loading, hasMore, error, loadMore: loadNextPage };
}
