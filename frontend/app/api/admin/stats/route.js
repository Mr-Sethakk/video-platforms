export async function GET() {
  return Response.json({
    success: true,
    code: 200,
    message: "操作成功",
    data: {
      totalVideos: 156,
      pendingVideos: 23,
      approvedVideos: 128,
      rejectedVideos: 5,
    },
  });
}
