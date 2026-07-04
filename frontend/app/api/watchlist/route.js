import movies from '@/app/api/_data/movies';
import watchlists from '@/app/api/_data/watchlist';

function getUser(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  try {
    const token = authHeader.slice(7);
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const user = getUser(request);
  if (!user) {
    return Response.json(
      { success: false, code: 401, message: "未登录", data: null },
      { status: 401 }
    );
  }

  const userWatchlist = watchlists.get(user.userId) || new Set();
  // 将 ID 集合映射为完整电影对象
  const movieMap = new Map(movies.map((m) => [m.id, m]));
  const fullMovies = Array.from(userWatchlist)
    .map((id) => movieMap.get(id))
    .filter(Boolean);

  return Response.json({
    success: true,
    code: 200,
    message: "操作成功",
    data: fullMovies,
  });
}

export async function POST(request) {
  const user = getUser(request);
  if (!user) {
    return Response.json(
      { success: false, code: 401, message: "未登录", data: null },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { movieId } = body;

    if (!movieId) {
      return Response.json(
        { success: false, code: 400, message: "缺少movieId参数", data: null },
        { status: 400 }
      );
    }

    if (!watchlists.has(user.userId)) {
      watchlists.set(user.userId, new Set());
    }
    watchlists.get(user.userId).add(movieId);

    return Response.json({
      success: true,
      code: 200,
      message: "操作成功",
      data: Array.from(watchlists.get(user.userId)),
    });
  } catch {
    return Response.json(
      { success: false, code: 400, message: "请求参数错误", data: null },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const user = getUser(request);
  if (!user) {
    return Response.json(
      { success: false, code: 401, message: "未登录", data: null },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const movieId = parseInt(searchParams.get("movieId"));

  if (!movieId) {
    return Response.json(
      { success: false, code: 400, message: "缺少movieId参数", data: null },
      { status: 400 }
    );
  }

  const userWatchlist = watchlists.get(user.userId);
  if (userWatchlist) {
    userWatchlist.delete(movieId);
  }

  return Response.json({
    success: true,
    code: 200,
    message: "操作成功",
    data: userWatchlist ? Array.from(userWatchlist) : [],
  });
}
