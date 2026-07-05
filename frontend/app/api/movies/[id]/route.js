import movies from '@/app/api/_data/movies';

export async function GET(request, { params }) {
  const { id } = await params;
  const movie = movies.find((m) => m.id === parseInt(id));

  if (!movie) {
    return Response.json(
      { success: false, code: 404, message: "电影不存在", data: null },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    code: 200,
    message: "操作成功",
    data: movie,
  });
}
