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

export async function DELETE(request, { params }) {
  const user = getUser(request);
  if (!user) {
    return Response.json(
      { success: false, code: 401, message: "未登录", data: null },
      { status: 401 }
    );
  }

  const { movieId } = await params;
  const id = parseInt(movieId);

  const userWatchlist = watchlists.get(user.userId);
  if (userWatchlist) {
    userWatchlist.delete(id);
  }

  return Response.json({
    success: true,
    code: 200,
    message: "操作成功",
    data: userWatchlist ? Array.from(userWatchlist) : [],
  });
}
