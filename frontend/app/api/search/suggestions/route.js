import movies from '@/app/api/_data/movies';
import { SEARCH } from '@/lib/constants';

/**
 * 过滤特殊字符：仅保留汉字、字母、数字、空格
 */
function cleanKeyword(raw) {
  return raw.replace(/[^一-龥a-zA-Z0-9\s]/g, '').trim();
}

/**
 * 取第一个关键词（空格前）
 */
function firstKeyword(cleaned) {
  const spaceIndex = cleaned.search(/\s/);
  return spaceIndex === -1 ? cleaned : cleaned.slice(0, spaceIndex);
}

/**
 * 检查文本是否匹配关键词（不区分大小写）
 */
function matches(text, keyword) {
  if (!text || !keyword) return false;
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * 判断匹配类型
 */
function getMatchType(movie, keyword) {
  const types = [];
  if (matches(movie.title, keyword)) types.push('电影');
  if (matches(movie.director, keyword)) types.push('导演');
  if (matches(movie.genre, keyword)) types.push('类型');
  if (String(movie.year).includes(keyword)) types.push('年份');
  return types;
}

/**
 * 计算匹配得分（用于排序）
 */
function getMatchScore(movie, keyword) {
  let score = 0;
  // 标题精确匹配最高分
  if (movie.title.toLowerCase() === keyword.toLowerCase()) score += 100;
  else if (matches(movie.title, keyword)) score += 50;
  // 导演匹配
  if (matches(movie.director, keyword)) score += 30;
  // 类型匹配
  if (matches(movie.genre, keyword)) score += 10;
  // 年份匹配
  if (String(movie.year).includes(keyword)) score += 5;
  // 简介匹配
  if (matches(movie.description, keyword)) score += 3;
  return score;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q') || '';

  // 无输入直接返回空
  if (!rawQuery.trim()) {
    return Response.json({
      success: true,
      code: 200,
      message: '操作成功',
      data: { suggestions: [] },
    });
  }

  // 过滤特殊字符 + 取第一个关键词
  const cleaned = cleanKeyword(rawQuery);
  const keyword = firstKeyword(cleaned);

  if (!keyword) {
    return Response.json({
      success: true,
      code: 200,
      message: '操作成功',
      data: { suggestions: [] },
    });
  }

  // 全字段匹配
  const matched = movies
    .filter((m) => {
      return (
        matches(m.title, keyword) ||
        matches(m.director, keyword) ||
        matches(m.genre, keyword) ||
        String(m.year).includes(keyword) ||
        matches(m.description, keyword)
      );
    })
    .map((m) => ({
      ...m,
      _matchTypes: getMatchType(m, keyword),
      _matchScore: getMatchScore(m, keyword),
    }))
    // 排序：评分 > 匹配度 > 年份
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b._matchScore !== a._matchScore) return b._matchScore - a._matchScore;
      return b.year - a.year;
    })
    .slice(0, SEARCH.MAX_SUGGESTIONS);

  // 移除内部字段后返回
  const suggestions = matched.map(({ _matchTypes, _matchScore, ...movie }) => ({
    ...movie,
    matchTypes: _matchTypes,
  }));

  return Response.json({
    success: true,
    code: 200,
    message: '操作成功',
    data: { suggestions },
  });
}
