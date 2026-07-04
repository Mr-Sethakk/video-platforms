import movies from '@/app/api/_data/movies';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = parseInt(searchParams.get("pageSize")) || 24;
  const genre = searchParams.get("genre");
  const sort = searchParams.get("sort");
  const q = searchParams.get("q");

  let filtered = [...movies];

  if (genre) {
    filtered = filtered.filter((m) => m.genre === genre);
  }

  if (q) {
    const keyword = q.toLowerCase();
    filtered = filtered.filter((m) => m.title.toLowerCase().includes(keyword));
  }

  if (sort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === "year") {
    filtered.sort((a, b) => b.year - a.year);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const records = filtered.slice(start, start + pageSize);

  return Response.json({
    success: true,
    code: 200,
    message: "操作成功",
    data: {
      records,
      total,
      page,
      pageSize,
      totalPages,
    },
  });
}
