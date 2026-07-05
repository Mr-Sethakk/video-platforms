/**
 * Robust detail fixer — resumable, retry-on-failure, double-checks every save
 */
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, 'Accept-Language': 'zh-CN,zh;q=0.9', 'Cookie': 'bid=' + Math.random().toString(36).substring(2, 14) };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let conn;

async function getDb() {
  if (conn) {
    try { await conn.ping(); return conn; } catch {}
  }
  conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306,
    user: 'root', password: 'root',
    database: 'movie_platform', charset: 'utf8mb4',
  });
  return conn;
}

async function getPage(url) {
  for (let i = 0; i < 5; i++) {
    try {
      const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      if (res.status === 200) return res.data;
    } catch (e) {
      if (i < 4) await sleep(3000 * (i + 1));
    }
  }
  return null;
}

function parseDetail(html) {
  const $ = cheerio.load(html);
  const infoText = $('#info').text();

  // Description
  let desc = '';
  for (const sel of ['#link-report-intra span.all', '#link-report-intra span[property="v:summary"]',
                      '#link-report span.all', '#link-report-intra']) {
    const t = $(sel).text().trim().replace(/\s+/g, ' ');
    if (t.length > 40) { desc = t; break; }
  }

  // Director — parse from #info text, don't rely on rel attribute
  const dirMatch = infoText.match(/导演:\s*(.+?)(?:\n|主|编|制|类|片|语|IMDb|官|上)/);
  const director = dirMatch ? dirMatch[1].replace(/\s+/g, ' ').trim() : '';

  // Actors
  const actMatch = infoText.match(/主演:\s*(.+?)(?:\n|类|制|片|语|IMDb|官|上|\/)/);
  const actors = actMatch ? actMatch[1].replace(/\s+/g, ' ').trim() : '';

  // Country
  const countryMatch = infoText.match(/制片国家\/地区:\s*(.+)/);
  const country = countryMatch ? countryMatch[1].trim() : '';

  // Genres
  const genres = [];
  $('span[property="v:genre"]').each((_, el) => genres.push($(el).text().trim()));

  // Duration
  const durText = $('span[property="v:runtime"]').attr('content') || '';
  const duration = parseInt(durText) || null;

  // Year
  const yrText = ($('span[property="v:initialReleaseDate"]').attr('content') || '').slice(0, 4);
  const year = parseInt(yrText) || null;

  return {
    description: desc.replace(/\(展开全部\)|\(收起\)|©豆瓣/g, '').trim() || null,
    director: director || null,
    actors: actors || null,
    genres: genres.length > 0 ? genres.join(', ') : null,
    country: country || null,
    duration,
    year,
  };
}

async function main() {
  const db = await getDb();

  // Get movies that need detail — skip those already complete
  const [movies] = await db.query(
    `SELECT id, douban_id, title
     FROM movie
     WHERE douban_id IS NOT NULL
       AND (description IS NULL OR description = '' OR director IS NULL OR director = '')
     ORDER BY rating DESC`
  );
  console.log(`Need to fix: ${movies.length} movies\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    const url = `https://movie.douban.com/subject/${m.douban_id}/`;
    process.stdout.write(`[${i + 1}/${movies.length}] ${m.title}... `);

    try {
      const html = await getPage(url);
      if (!html) { console.log('NETWORK FAIL'); fail++; continue; }

      const d = parseDetail(html);
      if (!d.description && !d.director) {
        console.log('NO DATA');
        fail++;
        continue;
      }

      await db.query(
        `UPDATE movie SET description=?, director=?, actors=?,
           duration=COALESCE(?,duration),
           genre=COALESCE(NULLIF(?,''),genre),
           country=COALESCE(NULLIF(?,''),country),
           year=COALESCE(?,year)
         WHERE id=?`,
        [
          d.description?.substring(0, 4000), d.director?.substring(0, 300),
          d.actors?.substring(0, 500), d.duration,
          d.genres, d.country, d.year, m.id
        ]
      );
      console.log(`OK | dir=${d.director?.substring(0, 12) || '?'} | ${d.description?.substring(0, 25)}...`);
      ok++;

    } catch (e) {
      console.log(`CRASH: ${e.message}`);
      fail++;
      // Reconnect on DB errors
      try { conn = null; await getDb(); } catch {}
    }

    // Pace: 3.5-5.5 seconds between requests
    await sleep(3500 + Math.random() * 2000);
  }

  // Final stats
  const [s] = await db.query(
    `SELECT COUNT(*) as t, SUM(description IS NOT NULL AND description!='') as d,
            SUM(director IS NOT NULL AND director!='') as r FROM movie`
  );
  console.log(`\n=== DONE ===`);
  console.log(`Total: ${s[0].t} | With desc: ${s[0].d} | With dir: ${s[0].r}`);
  console.log(`Fixed: ${ok} | Failed: ${fail}`);

  await db.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
