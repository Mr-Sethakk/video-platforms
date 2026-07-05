/**
 * Normalize all movie genres to single primary categories
 * Douban multi-label → single clean genre for proper filtering
 */
const mysql = require('mysql2/promise');

const PRIORITY_ORDER = [
  '纪录片', '动画', '科幻', '战争', '恐怖', '悬疑', '惊悚',
  '犯罪', '动作', '奇幻', '冒险', '歌舞', '音乐',
  '爱情', '喜剧', '剧情',
];

function pickGenre(raw) {
  if (!raw) return '剧情';
  for (const g of PRIORITY_ORDER) {
    if (raw.includes(g)) return g;
  }
  return '剧情';
}

// Manual overrides for edge cases
const OVERRIDES = {
  '三傻大闹宝莱坞': '喜剧',
  '大话西游之大圣娶亲': '喜剧',
  '大话西游之月光宝盒': '喜剧',
  '大闹天宫': '动画',
  '龙猫': '动画',
  '天空之城': '动画',
  '哈尔的移动城堡': '动画',
  '疯狂动物城': '动画',
  '狮子王': '动画',
  '飞屋环游记': '动画',
  '寻梦环游记': '动画',
  '红辣椒': '动画',
  '机器人总动员': '动画',
  '哈利·波特与魔法石': '奇幻',
  '哈利·波特与密室': '奇幻',
  '哈利·波特与阿兹卡班的囚徒': '奇幻',
  '哈利·波特与死亡圣器(下)': '奇幻',
  '指环王1：护戒使者': '奇幻',
  '指环王2：双塔奇兵': '奇幻',
  '指环王3：王者无敌': '奇幻',
  '加勒比海盗': '冒险',
  '阿凡达': '科幻',
  '蝴蝶效应': '悬疑',
  '黑客帝国': '科幻',
  '搏击俱乐部': '悬疑',
  '禁闭岛': '悬疑',
  '少年派的奇幻漂流': '冒险',
  '布达佩斯大饭店': '喜剧',
  '海豚湾': '纪录片',
  '素媛': '剧情',
  '熔炉': '剧情',
  '辩护人': '剧情',
  '狩猎': '悬疑',
  '何以为家': '剧情',
  '绿皮书': '剧情',
  '触不可及': '喜剧',
  '摔跤吧！爸爸': '剧情',
  '楚门的世界': '剧情',
  '当幸福来敲门': '剧情',
  '美丽心灵': '剧情',
  '猫鼠游戏': '犯罪',
  '无间道': '犯罪',
  '教父': '犯罪',
  '教父2': '犯罪',
  '沉默的羔羊': '惊悚',
  '致命魔术': '悬疑',
  '控方证人': '悬疑',
  '看不见的客人': '悬疑',
  '低俗小说': '犯罪',
  '两杆大烟枪': '喜剧',
  '鬼子来了': '喜剧',
  '让子弹飞': '动作',
  '功夫': '动作',
  '唐伯虎点秋香': '喜剧',
  '喜剧之王': '喜剧',
  '十二怒汉': '剧情',
  '罗马假日': '爱情',
  '泰坦尼克号': '爱情',
  '怦然心动': '爱情',
  '西西里的美丽传说': '剧情',
  '情书': '爱情',
  '春光乍泄': '爱情',
  '音乐之声': '歌舞',
  '穿条纹睡衣的男孩': '战争',
  '辛德勒的名单': '战争',
  '拯救大兵瑞恩': '战争',
  '钢琴家': '战争',
  '美丽人生': '战争',
  '窃听风暴': '剧情',
  '飞越疯人院': '剧情',
  '死亡诗社': '剧情',
  '心灵捕手': '剧情',
  '超脱': '剧情',
  '本杰明·巴顿奇事': '剧情',
  '饮食男女': '剧情',
  '一一': '剧情',
  '活着': '剧情',
  '乱世佳人': '剧情',
  '天堂电影院': '剧情',
  '小鞋子': '剧情',
  '海蒂和爷爷': '剧情',
  '闻香识女人': '剧情',
  '我是山姆': '剧情',
  '忠犬八公的故事': '剧情',
  '放牛班的春天': '剧情',
  '海上钢琴师': '剧情',
  '肖申克的救赎': '剧情',
  '阿甘正传': '剧情',
  '千与千寻': '动画',
  '霸王别姬': '剧情',
  '星际穿越': '科幻',
  '盗梦空间': '科幻',
  '这个杀手不太冷': '动作',
  '蝙蝠侠：黑暗骑士': '动作',
  '我不是药神': '剧情',
  '还有明天': '剧情',
  '摩登时代': '喜剧',
};

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306,
    user: 'root', password: 'root',
    database: 'movie_platform', charset: 'utf8mb4',
  });

  const [movies] = await conn.query('SELECT id, title, genre FROM movie');

  let updated = 0;
  for (const m of movies) {
    const newGenre = OVERRIDES[m.title] || pickGenre(m.genre);
    if (m.genre !== newGenre) {
      await conn.query('UPDATE movie SET genre = ? WHERE id = ?', [newGenre, m.id]);
      updated++;
    }
  }

  console.log(`Updated: ${updated} / ${movies.length}`);

  const [stats] = await conn.query(
    'SELECT genre, COUNT(*) as cnt FROM movie GROUP BY genre ORDER BY cnt DESC'
  );
  console.log('\n=== Genre distribution ===');
  for (const s of stats) console.log(`  ${s.genre}: ${s.cnt}`);

  await conn.end();
  console.log('DONE');
}

main().catch(e => { console.error(e); process.exit(1); });
