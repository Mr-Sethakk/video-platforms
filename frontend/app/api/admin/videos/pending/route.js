export async function GET() {
  const pendingVideos = [
    {
      id: 101,
      title: "长安三万里",
      description: "一部展现盛唐气象的动画电影，讲述了李白和高适的故事。",
      uploader: "用户A",
      createdAt: "2026-07-01T10:30:00Z",
      tags: ["动画", "历史", "唐朝"],
    },
    {
      id: 102,
      title: "深海奇缘",
      description: "深海探险纪录片，展示海洋生物的神奇世界。",
      uploader: "用户B",
      createdAt: "2026-07-02T14:20:00Z",
      tags: ["纪录片", "海洋", "自然"],
    },
    {
      id: 103,
      title: "城市之光",
      description: "现代都市爱情故事，两个陌生人在城市中相遇相知。",
      uploader: "用户C",
      createdAt: "2026-07-02T16:45:00Z",
      tags: ["爱情", "都市", "剧情"],
    },
    {
      id: 104,
      title: "电竞之王",
      description: "讲述职业电竞选手成长历程的热血故事。",
      uploader: "用户D",
      createdAt: "2026-07-03T09:15:00Z",
      tags: ["运动", "电竞", "励志"],
    },
    {
      id: 105,
      title: "美食江湖",
      description: "一部关于中国传统美食文化的纪录片系列。",
      uploader: "用户E",
      createdAt: "2026-07-03T11:00:00Z",
      tags: ["纪录片", "美食", "文化"],
    },
  ];

  return Response.json({
    success: true,
    code: 200,
    message: "操作成功",
    data: pendingVideos,
  });
}
