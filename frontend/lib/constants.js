// ========== 常量配置 ==========
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/** 电影分类 — 与数据库实际分类对齐 */
export const GENRES = [
  '剧情', '喜剧', '动画', '悬疑', '奇幻', '犯罪',
  '战争', '爱情', '动作', '科幻', '冒险', '惊悚',
  '歌舞', '纪录片',
];

/** 分类图标映射 */
export const GENRE_ICONS = {
  '剧情': '🎭', '喜剧': '😂', '动画': '✨', '悬疑': '🔍',
  '奇幻': '🧙', '犯罪': '🕵️', '战争': '⚔️', '爱情': '❤️',
  '动作': '💥', '科幻': '🚀', '冒险': '🗺️', '惊悚': '😱',
  '歌舞': '💃', '纪录片': '📹',
};

export const SORT_OPTIONS = [
  { label: '默认排序', value: 'default' },
  { label: '评分最高', value: 'rating' },
  { label: '最新上映', value: 'year' },
];

export const DEFAULT_POSTER = '/images/default-poster.jpg';

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SIDEBAR: 'sidebar_collapsed',
};

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

// 快速问题建议（AI聊天）
export const QUICK_QUESTIONS = [
  '推荐一部科幻电影',
  '最近有什么好电影',
  '介绍《肖申克的救赎》',
  '推荐评分最高的电影',
];

// ========== 搜索相关 ==========
export const SEARCH = {
  /** 搜索历史存储上限 */
  MAX_HISTORY: 20,
  /** 搜索关键词最大长度 */
  MAX_KEYWORD_LENGTH: 50,
  /** 联想请求防抖延迟（ms） */
  DEBOUNCE_MS: 700,
  /** 联想结果最大展示数量 */
  MAX_SUGGESTIONS: 5,
  /** 搜索历史 localStorage key */
  HISTORY_KEY: 'search_history',
};
