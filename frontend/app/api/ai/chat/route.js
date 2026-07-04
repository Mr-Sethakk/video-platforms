const movies = [
  { id: 1, title: "肖申克的救赎", rating: 9.7, year: 1994, genre: "剧情", director: "弗兰克·德拉邦特", duration: 142, description: "希望让人自由。" },
  { id: 2, title: "星际穿越", rating: 9.4, year: 2014, genre: "科幻", director: "克里斯托弗·诺兰", duration: 169, description: "爱能穿越维度。" },
  { id: 3, title: "泰坦尼克号", rating: 9.4, year: 1997, genre: "爱情", director: "詹姆斯·卡梅隆", duration: 194, description: "永恒的爱情传奇。" },
  { id: 4, title: "盗梦空间", rating: 9.3, year: 2010, genre: "科幻", director: "克里斯托弗·诺兰", duration: 148, description: "你的梦境就是犯罪现场。" },
  { id: 6, title: "千与千寻", rating: 9.4, year: 2001, genre: "动画", director: "宫崎骏", duration: 125, description: "在神灵世界中成长。" },
  { id: 8, title: "霸王别姬", rating: 9.6, year: 1993, genre: "剧情", director: "陈凯歌", duration: 171, description: "不疯魔不成活。" },
  { id: 14, title: "流浪地球", rating: 7.9, year: 2019, genre: "科幻", director: "郭帆", duration: 125, description: "带着地球去流浪。" },
  { id: 15, title: "哪吒之魔童降世", rating: 8.4, year: 2019, genre: "动画", director: "饺子", duration: 110, description: "我命由我不由天！" },
  { id: 24, title: "无间道", rating: 9.3, year: 2002, genre: "犯罪", director: "刘伟强", duration: 101, description: "出来混，迟早要还的。" },
  { id: 27, title: "我不是药神", rating: 9.0, year: 2018, genre: "剧情", director: "文牧野", duration: 117, description: "世界上只有一种病：穷病。" },
];

function generateResponse(message) {
  const msg = message.toLowerCase();

  // Check for specific movie names
  for (const movie of movies) {
    if (message.includes(movie.title)) {
      return `${movie.title}是由${movie.director}执导的${movie.year}年${movie.genre}电影，评分${movie.rating}分。${movie.description}`;
    }
  }

  // Recommend movies
  if (msg.includes("推荐") || msg.includes("推荐电影") || msg.includes("科幻") || msg.includes("好看")) {
    const recs = movies
      .filter((m) => m.rating >= 9.0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    let response = "根据您的喜好，我为您推荐以下电影：\n\n";
    recs.forEach((m, i) => {
      response += `${i + 1}. 《${m.title}》(${m.year}) - ${m.genre} | 评分：${m.rating}\n   ${m.description}\n\n`;
    });
    response += "希望您喜欢这些推荐！有其他需要可以随时问我。";
    return response;
  }

  // Default response
  return "您好！我是电影推荐助手。我可以帮您：\n1. 推荐好看的电影（试试说\"推荐几部好看的电影\"）\n2. 查询特定电影的信息（试试说电影名如\"肖申克的救赎\"）\n3. 按类型推荐电影（试试说\"科幻电影推荐\"）\n4. 解答电影相关问题\n\n请问有什么可以帮您的？";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return Response.json(
        { success: false, code: 400, message: "缺少message参数", data: null },
        { status: 400 }
      );
    }

    const responseText = generateResponse(message);
    const chunks = [];
    const chunkSize = 3;

    for (let i = 0; i < responseText.length; i += chunkSize) {
      chunks.push(responseText.slice(i, i + chunkSize));
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        for (const chunk of chunks) {
          const sseData = `data: ${JSON.stringify({ chunk })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          await delay(50);
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json(
      { success: false, code: 400, message: "请求参数错误", data: null },
      { status: 400 }
    );
  }
}
