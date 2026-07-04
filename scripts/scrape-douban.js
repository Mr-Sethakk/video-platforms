/**
 * Douban Top 100 Movie Scraper
 * Scrapes movie data from movie.douban.com/top250 and detail pages,
 * then inserts into MySQL.
 */
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');

const LIST_URL = 'https://movie.douban.com/top250';
const DETAIL_URL = 'https://movie.douban.com/subject';

// Browser-like headers to avoid being blocked
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cookie': 'bid=' + Math.random().toString(36).substring(2, 14),
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        headers: HEADERS,
        timeout: 15000,
      });
      return response.data;
    } catch (err) {
      console.error(`  Request failed (${i + 1}/${retries}): ${err.message}`);
      if (i < retries - 1) await sleep(3000 * (i + 1));
    }
  }
  return null;
}

async function scrapeListPage(start) {
  const url = `${LIST_URL}?start=${start}&filter=`;
  console.log(`Fetching list: ${url}`);
  const html = await fetchPage(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const movies = [];

  $('.grid_view .item').each((_, el) => {
    const $item = $(el);
    const $link = $item.find('.hd a');
    const href = $link.attr('href') || '';
    const idMatch = href.match(/subject\/(\d+)/);
    const doubanId = idMatch ? idMatch[1] : null;

    const $pic = $item.find('.pic img');
    const posterUrl = ($pic.attr('src') || '').replace(/^https?:/, 'https:');

    const titles = [];
    $link.find('.title').each((_, t) => titles.push($(t).text().trim()));

    const ratingText = $item.find('.rating_num').text().trim();
    const rating = parseFloat(ratingText) || 0;

    const infoLine = $item.find('.bd p').first().text().trim();
    // Parse: "导演: xxx 主演: xxx / xxx ...  2024 / 美国 / 剧情"
    const yearMatch = infoLine.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;

    // Extract country and genre from the last part after year
    const parts = infoLine.split(/\s+\d{4}\s*/);
    let country = '', genreStr = '';
    if (parts.length > 1) {
      const metaParts = parts[1].split('/').map(s => s.trim()).filter(Boolean);
      country = metaParts[0] || '';
      genreStr = metaParts.slice(1).join('/');
    }

    const quote = $item.find('.quote .inq').text().trim();

    movies.push({
      doubanId,
      title: titles[0] || '',
      originalTitle: titles.length > 1 ? titles[1].replace(/\s+/g, ' ').trim() : '',
      rating,
      year,
      country,
      genreStr,
      posterUrl: posterUrl.replace(/@.*$/, ''), // remove size suffix for full res
      quote,
    });
  });

  return movies;
}

async function scrapeDetail(doubanId) {
  const url = `${DETAIL_URL}/${doubanId}/`;
  console.log(`  Detail: ${url}`);
  await sleep(2000); // Be polite - 2 second delay between detail pages
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  // Description
  const descEl = $('#link-report-intra span[property="v:summary"]');
  let description = descEl.length ? descEl.text().trim() : '';
  if (!description) {
    // Fallback: try the hidden content
    description = $('#link-report span[property="v:summary"]').text().trim();
  }
  if (!description) {
    // Fallback 2: try the short intro
    description = $('#link-report span.all').text().trim();
  }

  // Director
  const directors = [];
  $('a[rel="v:directedBy"]').each((_, d) => directors.push($(d).text().trim()));

  // Actors (lead actors)
  const actors = [];
  $('a[rel="v:starring"]').each((_, a) => actors.push($(a).text().trim()));

  // Runtime
  const durationText = $('span[property="v:runtime"]').attr('content') || '';
  const duration = parseInt(durationText) || null;

  // Genres from detail page (more accurate)
  const genres = [];
  $('span[property="v:genre"]').each((_, g) => genres.push($(g).text().trim()));

  // Release date
  const releaseDates = [];
  $('span[property="v:initialReleaseDate"]').each((_, d) => releaseDates.push($(d).text().trim()));

  return {
    description: description || null,
    director: directors.join(', ') || null,
    actors: actors.slice(0, 5).join(', ') || null,
    duration,
    genres: genres.join(', ') || null,
    releaseDate: releaseDates[0] || null,
  };
}

async function main() {
  // ===== Step 1: Scrape list pages =====
  console.log('=== Step 1: Scraping Douban Top 250 list ===\n');
  let allMovies = [];

  for (let start = 0; start < 100; start += 25) {
    const pageMovies = await scrapeListPage(start);
    allMovies.push(...pageMovies);
    console.log(`  Got ${pageMovies.length} movies from page offset ${start}`);
    if (start < 75) await sleep(3000); // 3s delay between pages
  }

  allMovies = allMovies.slice(0, 100);
  console.log(`\nTotal: ${allMovies.length} movies from list pages`);

  // ===== Step 2: Scrape detail pages for full info =====
  console.log('\n=== Step 2: Scraping detail pages ===\n');
  for (let i = 0; i < allMovies.length; i++) {
    const m = allMovies[i];
    if (!m.doubanId) {
      console.log(`  [${i + 1}/${allMovies.length}] ${m.title} - SKIP (no douban ID)`);
      continue;
    }
    console.log(`  [${i + 1}/${allMovies.length}] ${m.title}`);
    const detail = await scrapeDetail(m.doubanId);
    if (detail) {
      // Use detail page genres if available, otherwise use list page genres
      m.genre = detail.genres || m.genreStr;
      m.description = detail.description || m.quote;
      m.director = detail.director || '';
      m.actors = detail.actors || '';
      m.duration = detail.duration;
    } else {
      // Fallback without detail page
      m.genre = m.genreStr;
      m.description = m.quote;
      m.director = '';
      m.actors = '';
      m.duration = null;
    }
  }

  // ===== Step 3: Insert into MySQL =====
  console.log('\n=== Step 3: Inserting into MySQL ===\n');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'movie_platform',
    charset: 'utf8mb4',
  });

  // Clear existing movies
  await conn.query('DELETE FROM watchlist');
  await conn.query('DELETE FROM movie');
  await conn.query('ALTER TABLE movie AUTO_INCREMENT = 1');

  let inserted = 0;
  for (let i = 0; i < allMovies.length; i++) {
    const m = allMovies[i];
    if (!m.title) continue;
    try {
      await conn.query(
        `INSERT INTO movie (title, description, rating, year, genre, director, actors, poster_url, duration, country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.title,
          m.description?.substring(0, 2000) || null,
          m.rating,
          m.year,
          m.genre?.substring(0, 100) || null,
          m.director?.substring(0, 300) || null,
          m.actors?.substring(0, 500) || null,
          m.posterUrl?.substring(0, 500) || null,
          m.duration,
          m.country?.substring(0, 50) || null,
        ]
      );
      inserted++;
      console.log(`  [${inserted}] ${m.title} - ${m.genre} - ${m.rating}`);
    } catch (err) {
      console.error(`  FAIL ${m.title}: ${err.message}`);
    }
  }

  // Verify
  const [rows] = await conn.query('SELECT COUNT(*) as cnt FROM movie');
  console.log(`\n=== DONE: ${rows[0].cnt} movies inserted ===`);

  const [sample] = await conn.query('SELECT id, title, rating, genre, country FROM movie ORDER BY rating DESC LIMIT 10');
  console.log('\nTop 10 by rating:');
  sample.forEach(r => console.log(`  ${r.title}  ${r.rating}  ${r.genre}  ${r.country}`));

  await conn.end();
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
