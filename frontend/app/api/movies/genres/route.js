export async function GET() {
  const genres = [
    "剧情",
    "科幻",
    "爱情",
    "动作",
    "喜剧",
    "恐怖",
    "动画",
    "悬疑",
    "纪录片",
    "奇幻",
    "战争",
    "犯罪",
  ];

  return Response.json({
    success: true,
    code: 200,
    message: "操作成功",
    data: genres,
  });
}
