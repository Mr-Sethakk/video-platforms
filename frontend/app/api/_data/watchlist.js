// 使用 global 确保所有 API route 共享同一个 Map 实例
// 避免 Next.js 模块打包导致的多实例问题

if (!global.__watchlists) {
  global.__watchlists = new Map();
}

export default global.__watchlists;
