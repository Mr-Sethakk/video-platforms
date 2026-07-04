export async function PUT(request, { params }) {
  const { id } = await params;

  return Response.json({
    success: true,
    code: 200,
    message: "操作成功",
    data: {
      id: parseInt(id),
      status: "approved",
      approvedAt: new Date().toISOString(),
    },
  });
}
