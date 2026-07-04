/**
 * Fix missing movie details - scrape only what's missing
 * Uses longer delays and rotates User-Agents to avoid blocking
 */
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENTS[i % USER_AGENTS.length],
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Referer': 'https://movie.douban.com/top250',
        },
        timeout: 20000,
      });
      if (res.status === 200) return res.data;
      console.log(`  HTTP ${res.status}, retrying...`);
    } catch (e) {
      console.log(`  Attempt ${i + 1} failed: ${e.message}`);
    }
    await sleep(4000 * (i + 1));
  }
  return null;
}

async function scrapeDetail(html) {
  const $ = cheerio.load(html);

  // Description - try multiple selectors
  let desc = '';
  const descSelectors = [
    '#link-report-intra span[property="v:summary"]',
    '#link-report-intra .all.hidden',
    '#link-report span[property="v:summary"]',
    '#link-report span.all.hidden',
    '#link-report-intra',
    '#link-report',
  ];
  for (const sel of descSelectors) {
    const el = $(sel);
    if (el.length) {
      desc = el.text().trim().replace(/\s+/g, ' ');
      if (desc.length > 20) break;
    }
  }
  // Remove trailing "(展开全部)" or similar
  desc = desc.replace(/\(展开全部\)|©豆瓣/g, '').trim();

  // Director
  const directors = $('a[rel="v:directedBy"]').map((_, el) => $(el).text().trim()).get();

  // Actors - lead stars
  const actors = $('a[rel="v:starring"]').map((_, el) => $(el).text().trim()).get().slice(0, 5);

  // Duration
  const duration = parseInt($('span[property="v:runtime"]').attr('content') || '') || null;

  // Genres from detail
  const genres = $('span[property="v:genre"]').map((_, el) => $(el).text().trim()).get();

  // Year from detail
  const year = parseInt(($('span[property="v:initialReleaseDate"]').attr('content') || '').slice(0, 4)) || null;

  // Country - parse from info line
  let country = '';
  const infoText = $('#info').text();
  const countryMatch = infoText.match(/制片国家\/地区:\s*(.+)/);
  if (countryMatch) country = countryMatch[1].trim();

  return {
    description: desc || null,
    director: directors.join(', ') || null,
    actors: actors.join(', ') || null,
    duration,
    genres: genres.join(', ') || null,
    year,
    country: country || null,
  };
}

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306,
    user: 'root', password: 'root',
    database: 'movie_platform', charset: 'utf8mb4',
  });

  // Get movies that need detail info
  const [movies] = await conn.query(
    'SELECT id, douban_id, title FROM movie ORDER BY rating DESC'
  );

  console.log(`Movies to fix: ${movies.length}`);
  let fixed = 0, skipped = 0;

  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    const doubanId = m.douban_id;

    if (!doubanId) {
      console.log(`[${i + 1}/${movies.length}] ${m.title} - SKIP (no douban ID)`);
      skipped++;
      continue;
    }

    // Check if this movie already has good data
    const [existing] = await conn.query(
      'SELECT description, director, actors FROM movie WHERE id = ?', [m.id]
    );
    if (existing[0]?.description && existing[0]?.description.length > 20 &&
        existing[0]?.director && existing[0]?.director.length > 0) {
      console.log(`[${i + 1}/${movies.length}] ${m.title} - SKIP (already has data)`);
      skipped++;
      continue;
    }

    const url = `https://movie.douban.com/subject/${doubanId}/`;
    console.log(`[${i + 1}/${movies.length}] ${m.title} (${url})`);
    const html = await fetchWithRetry(url);
    if (!html) {
      console.log(`  FAILED - no response`);
      skipped++;
      continue;
    }

    const detail = await scrapeDetail(html);
    if (!detail || (!detail.description && !detail.director)) {
      console.log(`  FAILED - no data parsed`);
      skipped++;
      continue;
    }

    await conn.query(
      `UPDATE movie
       SET description = ?, director = ?, actors = ?, duration = COALESCE(?, duration),
           genre = COALESCE(NULLIF(?, ''), genre), year = COALESCE(?, year),
           country = COALESCE(NULLIF(?, ''), country)
       WHERE id = ?`,
      [
        detail.description?.substring(0, 3000) || null,
        detail.director?.substring(0, 300) || null,
        detail.actors?.substring(0, 500) || null,
        detail.duration,
        detail.genres,
        detail.year,
        detail.country,
        m.id,
      ]
    );
    fixed++;
    console.log(`  OK: ${detail.director || 'no dir'} | ${(detail.description || '').substring(0, 40)}`);

    // Delay: 5-8 seconds between details to be polite
    await sleep(5000 + Math.random() * 3000);
  }

  // Verify
  const [stats] = await conn.query(
    `SELECT COUNT(*) as total,
            SUM(description IS NOT NULL AND description != '') as has_desc,
            SUM(director IS NOT NULL AND director != '') as has_dir
     FROM movie`
  );
  console.log(`\n=== FINAL STATS ===`);
  console.log(`Total: ${stats[0].total}`);
  console.log(`With description: ${stats[0].has_desc}`);
  console.log(`With director: ${stats[0].has_dir}`);
  console.log(`Fixed this run: ${fixed}, Skipped: ${skipped}`);

  await conn.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
