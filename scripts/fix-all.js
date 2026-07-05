/**
 * Phase 1: Fill douban_id from list pages (fast, 4 requests)
 * Phase 2: Fill description/director/actors from detail pages (slow, 100 requests)
 */
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, 'Accept-Language': 'zh-CN,zh;q=0.9' };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function get(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, { headers: HEADERS, timeout: 20000 });
      if (res.status === 200) return res.data;
    } catch (e) { /* retry */ }
    if (i < retries - 1) await sleep(3000 * (i + 1));
  }
  return null;
}

// ============ PHASE 1: Fill douban_ids from list ============
async function fillDoubanIds(conn) {
  console.log('=== Phase 1: Filling douban_ids ===\n');

  const titleIdMap = {};
  for (let start = 0; start < 100; start += 25) {
    const url = `https://movie.douban.com/top250?start=${start}&filter=`;
    console.log(`  List: ${url}`);
    const html = await get(url);
    if (!html) { console.log('  FAILED'); continue; }
    const $ = cheerio.load(html);
    $('.grid_view .item').each((_, el) => {
      const href = $('.hd a', el).attr('href') || '';
      const idMatch = href.match(/subject\/(\d+)/);
      const title = $('.hd .title', el).first().text().trim();
      if (idMatch && title) titleIdMap[title] = idMatch[1];
    });
    console.log(`  Found ${$('.grid_view .item').length} movies`);
    if (start < 75) await sleep(2000);
  }

  console.log(`\n  Total douban IDs collected: ${Object.keys(titleIdMap).length}`);

  // Update DB - try exact match first, then fuzzy
  let matched = 0;
  for (const [scrapedTitle, doubanId] of Object.entries(titleIdMap)) {
    // Exact match
    let [res] = await conn.query('UPDATE movie SET douban_id = ? WHERE title = ? AND douban_id IS NULL', [doubanId, scrapedTitle]);
    if (res.affectedRows > 0) { matched++; continue; }

    // Try LIKE match (some titles have subtitle differences)
    const shortTitle = scrapedTitle.replace(/[:\s：·]+/g, '').substring(0, 8);
    [res] = await conn.query(
      "UPDATE movie SET douban_id = ? WHERE REPLACE(REPLACE(REPLACE(title, ':', ''), ' ', ''), '·', '') LIKE ? AND douban_id IS NULL",
      [doubanId, `%${shortTitle}%`]
    );
    if (res.affectedRows > 0) matched++;
  }

  console.log(`  Matched + updated: ${matched}`);
  return matched;
}

// ============ PHASE 2: Fill details ============
async function fillDetails(conn) {
  console.log('\n=== Phase 2: Filling details ===\n');

  const [movies] = await conn.query(
    "SELECT id, douban_id, title FROM movie WHERE (description IS NULL OR description = '' OR director IS NULL OR director = '') AND douban_id IS NOT NULL ORDER BY rating DESC"
  );

  console.log(`  Movies to fix: ${movies.length}\n`);
  let fixed = 0, failed = 0;

  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    const url = `https://movie.douban.com/subject/${m.douban_id}/`;
    console.log(`  [${i + 1}/${movies.length}] ${m.title}`);

    const html = await get(url);
    if (!html) { failed++; console.log('    FAILED (network)'); continue; }

    const $ = cheerio.load(html);

    // ---- Description ----
    let desc = '';
    for (const sel of ['#link-report-intra span.all', '#link-report-intra span[property="v:summary"]',
                        '#link-report span.all', '#link-report-intra']) {
      const text = $(sel).text().trim().replace(/\s+/g, ' ');
      if (text.length > 30) { desc = text; break; }
    }
    desc = desc.replace(/\(展开全部\)|\(收起\)|©豆瓣/g, '').trim();

    // ---- Director ----
    const directors = [];
    $('a[rel="v:directedBy"]').each((_, el) => directors.push($(el).text().trim()));

    // ---- Actors ----
    const actors = [];
    $('a[rel="v:starring"]').each((_, el) => actors.push($(el).text().trim()));

    // ---- Duration ----
    const duration = parseInt($('span[property="v:runtime"]').attr('content')) || null;

    // ---- Genres ----
    const genres = $('span[property="v:genre"]').map((_, el) => $(el).text().trim()).get();

    // ---- Country ----
    let country = '';
    const cm = $('#info').text().match(/制片国家\/地区:\s*(.+)/);
    if (cm) country = cm[1].trim();

    // ---- Year ----
    const yearVal = $('span[property="v:initialReleaseDate"]').attr('content') || '';
    const year = parseInt(yearVal.slice(0, 4)) || null;

    // ---- UPDATE ----
    await conn.query(
      `UPDATE movie SET description = ?, director = ?, actors = ?,
         duration = COALESCE(?, duration),
         genre = COALESCE(NULLIF(?, ''), genre),
         year = COALESCE(?, year),
         country = COALESCE(NULLIF(?, ''), country)
       WHERE id = ?`,
      [
        desc.substring(0, 3000) || null,
        directors.join(', ') || null,
        actors.slice(0, 5).join(', ') || null,
        duration, genres.join(', ') || null, year, country, m.id
      ]
    );
    fixed++;
    console.log(`    OK dir=${directors[0] || '?'} desc=${desc.substring(0, 30)}...`);

    // Wait 4-6 seconds between requests
    await sleep(rand(4000, 6000));
  }

  return { fixed, failed };
}

// ============ MAIN ============
async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306,
    user: 'root', password: 'root',
    database: 'movie_platform', charset: 'utf8mb4',
  });

  // Phase 1
  const idsMatched = await fillDoubanIds(conn);
  console.log(`\nPhase 1 done: ${idsMatched} douban_ids filled`);

  // Phase 2
  const { fixed, failed } = await fillDetails(conn);
  console.log(`\nPhase 2 done: ${fixed} fixed, ${failed} failed`);

  // Final stats
  const [s] = await conn.query(
    `SELECT COUNT(*) as total,
       SUM(CASE WHEN description IS NOT NULL AND description != '' THEN 1 ELSE 0 END) as has_desc,
       SUM(CASE WHEN director IS NOT NULL AND director != '' THEN 1 ELSE 0 END) as has_dir
     FROM movie`
  );
  console.log(`\n=== FINAL ===`);
  console.log(`Total movies:      ${s[0].total}`);
  console.log(`With description:  ${s[0].has_desc}`);
  console.log(`With director:     ${s[0].has_dir}`);

  await conn.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
