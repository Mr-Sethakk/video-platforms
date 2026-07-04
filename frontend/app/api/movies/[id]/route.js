const movies = [
  { id: 1, title: "肖申克的救赎", rating: 9.7, year: 1994, genre: "剧情", director: "弗兰克·德拉邦特", duration: 142, country: "美国", posterUrl: null, description: "希望让人自由。" },
  { id: 2, title: "星际穿越", rating: 9.4, year: 2014, genre: "科幻", director: "克里斯托弗·诺兰", duration: 169, country: "美国", posterUrl: null, description: "爱能穿越维度。" },
  { id: 3, title: "泰坦尼克号", rating: 9.4, year: 1997, genre: "爱情", director: "詹姆斯·卡梅隆", duration: 194, country: "美国", posterUrl: null, description: "永恒的爱情传奇。" },
  { id: 4, title: "盗梦空间", rating: 9.3, year: 2010, genre: "科幻", director: "克里斯托弗·诺兰", duration: 148, country: "美国", posterUrl: null, description: "你的梦境就是犯罪现场。" },
  { id: 5, title: "阿甘正传", rating: 9.5, year: 1994, genre: "剧情", director: "罗伯特·泽米吉斯", duration: 142, country: "美国", posterUrl: null, description: "生活就像一盒巧克力。" },
  { id: 6, title: "千与千寻", rating: 9.4, year: 2001, genre: "动画", director: "宫崎骏", duration: 125, country: "日本", posterUrl: null, description: "在神灵世界中成长。" },
  { id: 7, title: "这个杀手不太冷", rating: 9.4, year: 1994, genre: "动作", director: "吕克·贝松", duration: 110, country: "法国", posterUrl: null, description: "大叔与少女的故事。" },
  { id: 8, title: "霸王别姬", rating: 9.6, year: 1993, genre: "剧情", director: "陈凯歌", duration: 171, country: "中国", posterUrl: null, description: "不疯魔不成活。" },
  { id: 9, title: "楚门的世界", rating: 9.3, year: 1998, genre: "剧情", director: "彼得·威尔", duration: 103, country: "美国", posterUrl: null, description: "人生就是一场真人秀。" },
  { id: 10, title: "辛德勒的名单", rating: 9.5, year: 1993, genre: "战争", director: "史蒂文·斯皮尔伯格", duration: 195, country: "美国", posterUrl: null, description: "拯救一人即拯救全世界。" },
  { id: 11, title: "喜剧之王", rating: 8.8, year: 1999, genre: "喜剧", director: "周星驰", duration: 89, country: "中国香港", posterUrl: null, description: "我养你啊。" },
  { id: 12, title: "蝙蝠侠：黑暗骑士", rating: 9.2, year: 2008, genre: "动作", director: "克里斯托弗·诺兰", duration: 152, country: "美国", posterUrl: null, description: "why so serious?" },
  { id: 13, title: "你的名字", rating: 8.5, year: 2016, genre: "动画", director: "新海诚", duration: 106, country: "日本", posterUrl: null, description: "穿越时空的爱恋。" },
  { id: 14, title: "流浪地球", rating: 7.9, year: 2019, genre: "科幻", director: "郭帆", duration: 125, country: "中国", posterUrl: null, description: "带着地球去流浪。" },
  { id: 15, title: "哪吒之魔童降世", rating: 8.4, year: 2019, genre: "动画", director: "饺子", duration: 110, country: "中国", posterUrl: null, description: "我命由我不由天！" },
  { id: 16, title: "消失的爱人", rating: 8.7, year: 2014, genre: "悬疑", director: "大卫·芬奇", duration: 149, country: "美国", posterUrl: null, description: "婚姻的黑暗面。" },
  { id: 17, title: "教父", rating: 9.3, year: 1972, genre: "犯罪", director: "弗朗西斯·科波拉", duration: 175, country: "美国", posterUrl: null, description: "我会给他一个无法拒绝的提议。" },
  { id: 18, title: "大话西游", rating: 9.2, year: 1995, genre: "喜剧", director: "刘镇伟", duration: 110, country: "中国香港", posterUrl: null, description: "曾经有一份真诚的爱情..." },
  { id: 19, title: "指环王：王者无敌", rating: 9.2, year: 2003, genre: "奇幻", director: "彼得·杰克逊", duration: 201, country: "新西兰", posterUrl: null, description: "中土世界的最终决战。" },
  { id: 20, title: "沉默的羔羊", rating: 8.9, year: 1991, genre: "恐怖", director: "乔纳森·戴米", duration: 118, country: "美国", posterUrl: null, description: "吃人的心理学家。" },
  { id: 21, title: "美丽人生", rating: 9.5, year: 1997, genre: "剧情", director: "罗伯托·贝尼尼", duration: 116, country: "意大利", posterUrl: null, description: "最美的谎言。" },
  { id: 22, title: "黑客帝国", rating: 9.1, year: 1999, genre: "科幻", director: "沃卓斯基姐妹", duration: 136, country: "美国", posterUrl: null, description: "红药丸还是蓝药丸？" },
  { id: 23, title: "飞屋环游记", rating: 9.0, year: 2009, genre: "动画", director: "彼特·道格特", duration: 96, country: "美国", posterUrl: null, description: "最华丽的冒险是与你相守。" },
  { id: 24, title: "无间道", rating: 9.3, year: 2002, genre: "犯罪", director: "刘伟强", duration: 101, country: "中国香港", posterUrl: null, description: "出来混，迟早要还的。" },
  { id: 25, title: "疯狂动物城", rating: 9.2, year: 2016, genre: "动画", director: "拜恩·霍华德", duration: 109, country: "美国", posterUrl: null, description: "Anyone can be anything." },
  { id: 26, title: "哈利·波特与魔法石", rating: 9.0, year: 2001, genre: "奇幻", director: "克里斯·哥伦布", duration: 152, country: "英国", posterUrl: null, description: "你是一个巫师，哈利。" },
  { id: 27, title: "我不是药神", rating: 9.0, year: 2018, genre: "剧情", director: "文牧野", duration: 117, country: "中国", posterUrl: null, description: "世界上只有一种病：穷病。" },
  { id: 28, title: "让子弹飞", rating: 8.9, year: 2010, genre: "动作", director: "姜文", duration: 132, country: "中国", posterUrl: null, description: "让子弹再飞一会儿。" },
  { id: 29, title: "当幸福来敲门", rating: 9.1, year: 2006, genre: "剧情", director: "加布里尔·穆奇诺", duration: 117, country: "美国", posterUrl: null, description: "如果你有梦想，就要守护它。" },
  { id: 30, title: "龙猫", rating: 9.2, year: 1988, genre: "动画", director: "宫崎骏", duration: 86, country: "日本", posterUrl: null, description: "每个人心中都有一只龙猫。" },
  { id: 31, title: "绿皮书", rating: 8.9, year: 2018, genre: "剧情", director: "彼得·法雷里", duration: 130, country: "美国", posterUrl: null, description: "一段跨越种族的友谊。" },
  { id: 32, title: "寻梦环游记", rating: 9.1, year: 2017, genre: "动画", director: "李·昂克里奇", duration: 105, country: "美国", posterUrl: null, description: "真正的死亡是被遗忘。" },
  { id: 33, title: "寄生虫", rating: 8.8, year: 2019, genre: "悬疑", director: "奉俊昊", duration: 132, country: "韩国", posterUrl: null, description: "穷人气息的味道。" },
  { id: 34, title: "搏击俱乐部", rating: 9.0, year: 1999, genre: "剧情", director: "大卫·芬奇", duration: 139, country: "美国", posterUrl: null, description: "第一条规则：不能谈论搏击俱乐部。" },
  { id: 35, title: "忠犬八公的故事", rating: 9.3, year: 2009, genre: "剧情", director: "拉斯·霍尔斯道姆", duration: 93, country: "美国", posterUrl: null, description: "等你不久，一辈子而已。" },
  { id: 36, title: "少年派的奇幻漂流", rating: 9.1, year: 2012, genre: "奇幻", director: "李安", duration: 127, country: "美国", posterUrl: null, description: "一段不可思议的漂流之旅。" },
  { id: 37, title: "天空之城", rating: 9.1, year: 1986, genre: "动画", director: "宫崎骏", duration: 124, country: "日本", posterUrl: null, description: "寻找传说中的天空之城拉普达。" },
  { id: 38, title: "速度与激情7", rating: 8.3, year: 2015, genre: "动作", director: "温子仁", duration: 137, country: "美国", posterUrl: null, description: "最后一程，献给保罗。" },
  { id: 39, title: "霸王别姬", rating: 9.6, year: 1993, genre: "剧情", director: "陈凯歌", duration: 171, country: "中国", posterUrl: null, description: "风华绝代。" },
  { id: 40, title: "大鱼海棠", rating: 6.9, year: 2016, genre: "动画", director: "梁旋", duration: 105, country: "中国", posterUrl: null, description: "每条大鱼都会相遇。" },
  { id: 41, title: "侏罗纪公园", rating: 8.2, year: 1993, genre: "科幻", director: "史蒂文·斯皮尔伯格", duration: 127, country: "美国", posterUrl: null, description: "生命会找到出路。" },
  { id: 42, title: "釜山行", rating: 8.5, year: 2016, genre: "恐怖", director: "延尚昊", duration: 118, country: "韩国", posterUrl: null, description: "比丧尸更可怕的是人心。" },
  { id: 43, title: "唐伯虎点秋香", rating: 8.6, year: 1993, genre: "喜剧", director: "李力持", duration: 102, country: "中国香港", posterUrl: null, description: "别人笑我太疯癫，我笑他人看不穿。" },
  { id: 44, title: "速度与激情", rating: 7.9, year: 2001, genre: "动作", director: "罗伯·科恩", duration: 106, country: "美国", posterUrl: null, description: "地下赛车世界的开端。" },
  { id: 45, title: "药神", rating: 9.0, year: 2018, genre: "剧情", director: "文牧野", duration: 117, country: "中国", posterUrl: null, description: "中国现实主义力作。" },
  { id: 46, title: "恐怖直播", rating: 8.7, year: 2013, genre: "悬疑", director: "金秉祐", duration: 98, country: "韩国", posterUrl: null, description: "一个电话引爆的恐怖事件。" },
  { id: 47, title: "摔跤吧！爸爸", rating: 9.0, year: 2016, genre: "剧情", director: "尼特什·提瓦瑞", duration: 161, country: "印度", posterUrl: null, description: "为女儿而战的父亲。" },
  { id: 48, title: "调音师", rating: 8.2, year: 2018, genre: "悬疑", director: "斯里兰姆·拉格万", duration: 139, country: "印度", posterUrl: null, description: "假装盲人的钢琴师目睹谋杀。" },
  { id: 49, title: "指环王：护戒使者", rating: 9.1, year: 2001, genre: "奇幻", director: "彼得·杰克逊", duration: 178, country: "新西兰", posterUrl: null, description: "一枚戒指统领众戒。" },
  { id: 50, title: "指环王：双塔奇兵", rating: 9.1, year: 2002, genre: "奇幻", director: "彼得·杰克逊", duration: 179, country: "新西兰", posterUrl: null, description: "中土世界的黑暗降临。" },
];

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
