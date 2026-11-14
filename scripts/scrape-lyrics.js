#!/usr/bin/env node
/**
 * Scrapes song lyrics (native language + English) from eurovisionworld.com
 * country pages and stores them in Firebase under /lyrics/{year}/{country}.
 *
 * Each country page embeds a set of `lyrics_div` blocks: index 0 is always
 * the lyrics in the song's original/native language, and one of the other
 * blocks (sometimes the same one, when the song is already in English) has
 * data-lyrics-version="English". Lines are grouped into verses (<p> per
 * verse, <br> per line) which we preserve as-is.
 *
 * Usage:
 *   node scripts/scrape-lyrics.js 2026          scrape main ESC 2026 (Final/SF1/SF2 countries)
 *   node scripts/scrape-lyrics.js 2026 --asia   scrape Eurovision Asia 2026
 */

const { COUNTRY_NAMES, fetchUrl, putToFirebase, sleep } = require('./scrape-events.js');

const SLUG_OVERRIDES = {
  'The Netherlands': 'netherlands',
  'Republic of Ireland': 'ireland',
  'Bosnia & Herzegovina': 'bosnia-herzegovina',
  'Serbia & Montenegro': 'serbia-montenegro',
};

const NON_COUNTRY_SLUGS = new Set([
  'event', 'calendar', 'songs-videos', 'tickets', 'results',
  'semi-final', 'semi-final-1', 'semi-final-2', 'scoreboard'
]);

function slugify(name) {
  if (SLUG_OVERRIDES[name]) return SLUG_OVERRIDES[name];
  return name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '');
}

// No HTML-parsing library is available, but the markup is uniform enough for
// a careful regex pass: lyrics_div blocks never contain a nested <div>, so a
// non-greedy match up to the next </div> is safe.
function extractLyricsDivs(html) {
  const divs = [];
  const re = /<div class="lyrics_div(?:\s[^"]*)?"([^>]*)>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const content = m[2];
    const versionMatch = attrs.match(/data-lyrics-version="([^"]*)"/);
    const idxMatch = attrs.match(/data-lyrics-div="(\d+)"/);
    if (!versionMatch || !idxMatch) continue;
    divs.push({ version: versionMatch[1], index: +idxMatch[1], html: content });
  }
  divs.sort((a, b) => a.index - b.index);
  return divs;
}

function parseLyricsHtml(html) {
  const titleMatch = html.match(/<h3>([\s\S]*?)<\/h3>/);
  const title = titleMatch ? decodeEntities(stripTags(titleMatch[1])).trim() : '';
  const verses = [];
  const pRe = /<p>([\s\S]*?)<\/p>/g;
  let pm;
  while ((pm = pRe.exec(html))) {
    const lines = pm[1]
      .split(/<br\s*\/?>/)
      .map(l => decodeEntities(stripTags(l)).trim())
      .filter(l => l.length > 0);
    if (lines.length) verses.push(lines);
  }
  return { title, verses };
}

async function scrapeLyricsForPage(url) {
  const { status, body } = await fetchUrl(url);
  if (status !== 200) return null;

  const divs = extractLyricsDivs(body);
  if (!divs.length) return null;

  const native = parseLyricsHtml(divs[0].html);
  const nativeLang = divs[0].version;
  const result = { native: { language: nativeLang, title: native.title, verses: native.verses } };

  if (nativeLang === 'English') {
    result.english = { title: native.title, verses: native.verses };
  } else {
    const engDiv = divs.find(d => d.version === 'English');
    if (engDiv) {
      const english = parseLyricsHtml(engDiv.html);
      result.english = { title: english.title, verses: english.verses };
    }
  }

  return result;
}

async function getMainContestCountrySlugs(year) {
  const { status, body } = await fetchUrl(`https://eurovisionworld.com/eurovision/${year}/songs-videos`);
  if (status !== 200) return [];

  const nameBySlug = {};
  for (const name of Object.values(COUNTRY_NAMES)) {
    if (name) nameBySlug[slugify(name)] = name;
  }

  const slugs = new Set();
  const re = new RegExp(`href="/eurovision/${year}/([a-z-]+)"`, 'g');
  let m;
  while ((m = re.exec(body))) {
    if (!NON_COUNTRY_SLUGS.has(m[1])) slugs.add(m[1]);
  }

  const results = [];
  for (const slug of slugs) {
    const name = nameBySlug[slug];
    if (name) {
      results.push({ name, path: `/eurovision/${year}/${slug}` });
    } else {
      console.log(`  (skipping unrecognised slug "${slug}")`);
    }
  }
  return results;
}

function getAsiaCountrySlugs(year, countries) {
  return countries.map(name => ({ name, path: `/eurovision-asia/${year}/${slugify(name)}` }));
}

async function main() {
  const year = +process.argv[2];
  const isAsia = process.argv.includes('--asia');
  if (!year) {
    console.log('Usage: node scripts/scrape-lyrics.js <year> [--asia]');
    process.exit(1);
  }

  let targets;
  if (isAsia) {
    const asiaCountries = [
      'Vietnam', 'Cambodia', 'Laos', 'Mongolia', 'Bhutan', 'Philippines',
      'Bangladesh', 'Thailand', 'South Korea', 'Nepal', 'Malaysia'
    ];
    targets = getAsiaCountrySlugs(year, asiaCountries);
    console.log(`Scraping Eurovision Asia ${year} lyrics (${targets.length} countries)\n`);
  } else {
    targets = await getMainContestCountrySlugs(year);
    console.log(`Scraping Eurovision ${year} lyrics (${targets.length} countries)\n`);
  }

  for (const { name, path } of targets) {
    process.stdout.write(`  ${name} ... `);
    try {
      const lyrics = await scrapeLyricsForPage(`https://eurovisionworld.com${path}`);
      if (!lyrics) { console.log('no lyrics found'); await sleep(1500); continue; }
      await putToFirebase(`/lyrics/${year}/${encodeURIComponent(name)}.json`, lyrics);
      const langs = [lyrics.native ? lyrics.native.language : null, lyrics.english ? 'English' : null].filter(Boolean);
      console.log(`saved (${langs.join(', ')})`);
    } catch (e) {
      console.log(`error: ${e.message}`);
    }
    await sleep(1500);
  }

  console.log('\nDone!');
}

if (require.main === module) {
  main().catch(console.error);
}
