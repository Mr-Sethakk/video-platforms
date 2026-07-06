'use client';
import { useState, useCallback, useEffect } from 'react';
import { SEARCH } from '@/lib/constants';

const HISTORY_KEY = SEARCH.HISTORY_KEY;

function loadHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.keyword === 'string' && typeof item.timestamp === 'number'
    );
  } catch {
    return [];
  }
}

function saveHistory(history) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage full — silently ignore
  }
}

/**
 * 搜索历史 Hook
 * - 按用户 localStorage 独立存储，最多 20 条
 * - 大小写不敏感去重
 * - 按搜索时间倒序排列
 */
export function useSearchHistory() {
  const [history, setHistory] = useState([]);

  // 初始化加载
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  /** 添加一条搜索记录 */
  const addHistory = useCallback((keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const lower = trimmed.toLowerCase();

      // 去重：移除相同关键词（不区分大小写）的旧记录
      const filtered = prev.filter(
        (item) => item.keyword.toLowerCase() !== lower
      );

      // 新记录插入最前面
      const next = [
        { keyword: trimmed, timestamp: Date.now() },
        ...filtered,
      ].slice(0, SEARCH.MAX_HISTORY);

      saveHistory(next);
      return next;
    });
  }, []);

  /** 删除单条记录 */
  const deleteHistory = useCallback((keyword) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.keyword !== keyword);
      saveHistory(next);
      return next;
    });
  }, []);

  /** 清空全部记录 */
  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, addHistory, deleteHistory, clearHistory };
}
