/**
 * Download Douban poster images as binary and store in MySQL.
 * Slow pacing: 6-12 seconds between requests to avoid IP blocking.
 * Resumable: skips movies that already have poster_data.
 */
const axios = require('axios');
const mysql = require('mysql2/promise');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
];

function randSleep(min, max) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(r => setTimeout(r, ms));
}

async function downloadPoster(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENTS[i % USER_AGENTS.length],
          'Referer': 'https://movie.douban.com/',
          'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      });
      if (res.status === 200 && res.data && res.data.length > 500) {
        const ct = res.headers['content-type'] || 'image/webp';
        return { data: Buffer.from(res.data), contentType: ct };
      }
      console.log(`    HTTP ${res.status}, len=${res.data?.length || 0}, retrying...`);
    } catch (e) {
      console.log(`    Attempt ${i + 1} failed: ${e.message}`);
    }
    if (i < retries - 1) {
      console.log(`    Waiting 3s before retry...`);
      await randSleep(3000, 4000);
    }
  }
  return null;
}

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306,
    user: 'root', password: 'root',
    database: 'movie_platform', charset: 'utf8mb4',
  });

  // Get movies with poster_url but no poster_data yet
  const [movies] = await conn.query(
    `SELECT id, title, poster_url FROM movie
     WHERE poster_url IS NOT NULL AND poster_url != ''
       AND (poster_data IS NULL OR LENGTH(poster_data) = 0)
     ORDER BY rating DESC`
  );

  console.log(`Movies to download: ${movies.length}\n`);

  let ok = 0, fail = 0, skip = 0;
  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    const url = m.poster_url;
    if (!url || !url.startsWith('http')) {
      console.log(`[${i + 1}/${movies.length}] ${m.title} - SKIP (bad URL)`);
      skip++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${movies.length}] ${m.title}... `);
    const result = await downloadPoster(url);
    if (result && result.data && result.data.length > 500) {
      await conn.query(
        'UPDATE movie SET poster_data = ?, poster_content_type = ? WHERE id = ?',
        [result.data, result.contentType, m.id]
      );
      const kb = (result.data.length / 1024).toFixed(1);
      console.log(`OK ${kb}KB (${result.contentType})`);
      ok++;
    } else {
      console.log('FAIL');
      fail++;
    }

    // Pace: random 6-12 seconds between requests
    if (i < movies.length - 1) {
      const delay = Math.floor(Math.random() * 7000) + 5000; // 5-12s
      process.stdout.write(`    Next in ${(delay/1000).toFixed(0)}s...`);
      await randSleep(delay - 100, delay + 100);
      console.log('');
    }
  }

  const [stats] = await conn.query(
    `SELECT COUNT(*) as total,
            SUM(CASE WHEN poster_data IS NOT NULL AND LENGTH(poster_data) > 0 THEN 1 ELSE 0 END) as has_poster
     FROM movie`
  );
  console.log(`\n=== DONE ===`);
  console.log(`Downloaded: ${ok} | Failed: ${fail} | Skipped: ${skip}`);
  console.log(`Total: ${stats[0].total} | With poster: ${stats[0].has_poster}`);

  await conn.end();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
