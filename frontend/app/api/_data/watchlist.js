// 共享内存片单: Map<userId, Set<movieId>>
// 供 watchlist/route.js 和 watchlist/[movieId]/route.js 共用
const watchlists = new Map();

export default watchlists;
