#!/usr/bin/env node
/**
 * Scrapes participating countries from eurovisionworld.com for all years 2000-present
 * and stores them in Firebase under /catalog/{year}/{event}/countries
 *
 * Usage:
 *   node scripts/scrape-events.js              scrape SF1/SF2/Final for all years
 *   node scripts/scrape-events.js --asia 2026  scrape Eurovision Asia for one year
 *                                               (also writes artist/song to /songs/{year})
 */

const https = require('https');

const FIREBASE_URL = 'https://sm-euro-default-rtdb.europe-west1.firebasedatabase.app';

// Maps eurovisionworld.com 2-letter codes → country names matching VotingService
const COUNTRY_NAMES = {
  al: 'Albania',
  am: 'Armenia',
  au: 'Australia',
  at: 'Austria',
  az: 'Azerbaijan',
  by: 'Belarus',
  be: 'Belgium',
  ba: 'Bosnia & Herzegovina',
  bg: 'Bulgaria',
  hr: 'Croatia',
  cy: 'Cyprus',
  cz: 'Czechia',
  dk: 'Denmark',
  ee: 'Estonia',
  fi: 'Finland',
  fr: 'France',
  ge: 'Georgia',
  de: 'Germany',
  gi: 'Gibraltar',
  gr: 'Greece',
  hu: 'Hungary',
  is: 'Iceland',
  ie: 'Republic of Ireland',
  il: 'Israel',
  it: 'Italy',
  xk: 'Kosovo',
  lv: 'Latvia',
  li: 'Liechtenstein',
  lu: 'Luxembourg',
  lt: 'Lithuania',
  mt: 'Malta',
  md: 'Moldova',
  mc: 'Monaco',
  me: 'Montenegro',
  ma: 'Morocco',
  mk: 'North Macedonia',
  nl: 'The Netherlands',
  no: 'Norway',
  pl: 'Poland',
  pt: 'Portugal',
  ro: 'Romania',
  ru: 'Russia',
  sm: 'San Marino',
  rs: 'Serbia',
  cs: 'Serbia & Montenegro',
  sk: 'Slovakia',
  si: 'Slovenia',
  es: 'Spain',
  se: 'Sweden',
  ch: 'Switzerland',
  tr: 'Turkey',
  ua: 'Ukraine',
  gb: 'United Kingdom',
  yu: 'Yugoslavia',
  // Eurovision Asia
  bd: 'Bangladesh',
  bt: 'Bhutan',
  kh: 'Cambodia',
  la: 'Laos',
  my: 'Malaysia',
  mn: 'Mongolia',
  np: 'Nepal',
  ph: 'Philippines',
  kr: 'South Korea',
  th: 'Thailand',
  vn: 'Vietnam',
  // skip these (not real competing countries)
  wld: null,
  row: null,
};

function fetchUrl(url, redirectCount = 0) {
  if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    https.get({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Eurovision-catalog-scraper/1.0)' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.host}${res.headers.location}`;
        res.resume();
        return resolve(fetchUrl(next, redirectCount + 1));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function getVotingJsIdAndBody(year, suffix) {
  const url = `https://eurovisionworld.com/eurovision/${year}${suffix}`;
  const { status, body } = await fetchUrl(url);
  if (status !== 200) return { jsId: null, pageBody: null };
  const match = body.match(/\/scripts\/js\/voting\/(\d+)\.js/);
  return { jsId: match ? match[1] : null, pageBody: body };
}

function extractArray(js, varName) {
  const pattern = new RegExp(`${varName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`);
  const match = js.match(pattern);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractObject(js, varName) {
  const declIdx = js.search(new RegExp(`${varName}\\s*=\\s*\\{`));
  if (declIdx === -1) return null;
  const start = js.indexOf('{', declIdx);
  let depth = 0;
  for (let i = start; i < js.length; i++) {
    if (js[i] === '{') depth++;
    else if (js[i] === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(js.slice(start, i + 1)); } catch { return null; }
      }
    }
  }
  return null;
}

function getCountriesFromSource(source) {
  // voting_table_main is an object: { countryCode: [runningOrderPosition, ...], ... }
  // Index 0 of each value array is the running order position (1-based).
  // This is the authoritative source for performance order.
  const tableMain = extractObject(source, 'voting_table_main');
  if (tableMain && typeof tableMain === 'object') {
    const entries = Object.entries(tableMain)
      .filter(([code]) => COUNTRY_NAMES[code] !== undefined && COUNTRY_NAMES[code] !== null)
      .filter(([, data]) => Array.isArray(data) && typeof data[0] === 'number' && data[0] > 0)
      .sort((a, b) => a[1][0] - b[1][0]);
    if (entries.length > 0) {
      return entries.map(([code]) => COUNTRY_NAMES[code]);
    }
  }

  // Fallback for events where position data isn't published yet (e.g. upcoming Finals):
  // use voting_table_main_arr and merge in sub_arr (Big Five + SF qualifiers).
  const codes = extractArray(source, 'voting_table_main_arr') || [];
  const subArr = extractArray(source, 'voting_table_sub_arr');
  if (subArr) {
    const subCodes = Array.isArray(subArr[0]) ? subArr.flat() : subArr;
    for (const code of subCodes) {
      if (!codes.includes(code)) codes.push(code);
    }
  }

  return codes
    .filter(code => COUNTRY_NAMES[code] !== undefined && COUNTRY_NAMES[code] !== null)
    .map(code => COUNTRY_NAMES[code]);
}

async function getVotingJsBody(jsId) {
  const { status, body } = await fetchUrl(`https://eurovisionworld.com/scripts/js/voting/${jsId}.js`);
  return status === 200 ? body : null;
}

// voting_songs is an object: { countryCode: [artist, song, qualified], ... }, present
// on both SF and Final pages/voting-JS for every competing country that year (not just
// qualifiers), going back to at least 2000.
function getSongMetaFromSource(source) {
  const votingSongs = extractObject(source, 'voting_songs');
  if (!votingSongs || typeof votingSongs !== 'object') return {};
  const meta = {};
  for (const [code, data] of Object.entries(votingSongs)) {
    const name = COUNTRY_NAMES[code];
    if (!name || !Array.isArray(data)) continue;
    const [artist, song] = data;
    if (artist || song) meta[name] = { artist, song };
  }
  return meta;
}

function putToFirebase(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const parsed = new URL(`${FIREBASE_URL}${path}`);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// PATCH merges the given keys instead of overwriting the whole node (used for /songs
// so scraping one event doesn't clobber song metadata written by another).
function patchToFirebase(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const parsed = new URL(`${FIREBASE_URL}${path}`);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeEvent(year, eventName, urlSuffix) {
  process.stdout.write(`  ${year} ${eventName} ... `);
  try {
    const { jsId, pageBody } = await getVotingJsIdAndBody(year, urlSuffix);

    let source;
    if (jsId) {
      source = await getVotingJsBody(jsId);
    } else {
      // Newer pages embed voting data inline rather than in a separate JS file
      source = pageBody;
    }
    if (!source) { console.log('page not found'); return null; }

    const countries = getCountriesFromSource(source);
    if (!countries.length) { console.log('no countries found'); return null; }

    await putToFirebase(`/catalog/${year}/${eventName}.json`, { countries });

    const songMeta = getSongMetaFromSource(source);
    let songMsg = '';
    if (Object.keys(songMeta).length > 0) {
      await patchToFirebase(`/songs/${year}.json`, songMeta);
      songMsg = `, ${Object.keys(songMeta).length} with song info`;
    }

    console.log(`${countries.length} countries saved${songMsg}`);
    await sleep(1500);
    return countries;
  } catch (e) {
    console.log(`error: ${e.message}`);
    return null;
  }
}

// Eurovision Asia (and other "national"-template pages) embed the running order and
// song/artist data inline as `national_tables` / `national_songs`, rather than in a
// separate voting JS file. Scrapes one page and writes both the catalog entry and
// song metadata in a single pass.
async function scrapeAsiaEvent(year) {
  const url = `https://eurovisionworld.com/eurovision-asia/${year}`;
  process.stdout.write(`  ${year} Asia ... `);
  try {
    const { status, body } = await fetchUrl(url);
    if (status !== 200) { console.log('page not found'); return null; }

    const nationalSongs = extractObject(body, 'national_songs');
    const nationalTables = extractObject(body, 'national_tables');
    if (!nationalSongs || !nationalTables) { console.log('no song data found'); return null; }

    const table = Object.values(nationalTables)[0];
    if (!table || !Array.isArray(table.ro) || !Array.isArray(table.at)) {
      console.log('unrecognised table format'); return null;
    }

    const countries = [];
    const songMeta = {};
    for (let i = 0; i < table.ro.length; i++) {
      const countryName = table.ro[i][1];
      const songId = table.at[i] && table.at[i][0];
      if (!countryName || songId === undefined || songId === null) continue;
      countries.push(countryName);
      const entry = nationalSongs.songs && nationalSongs.songs[songId];
      if (entry) {
        const [artist, song] = entry;
        songMeta[countryName] = { artist, song };
      }
    }

    if (!countries.length) { console.log('no countries found'); return null; }

    await putToFirebase(`/catalog/${year}/Asia.json`, { countries });
    if (Object.keys(songMeta).length > 0) {
      await patchToFirebase(`/songs/${year}.json`, songMeta);
    }
    console.log(`${countries.length} countries saved (${Object.keys(songMeta).length} with song info)`);
    return countries;
  } catch (e) {
    console.log(`error: ${e.message}`);
    return null;
  }
}

async function main() {
  const currentYear = new Date().getFullYear();
  console.log(`Scraping Eurovision ${2000}–${currentYear}\n`);

  for (let year = 2000; year <= currentYear; year++) {
    const allForYear = new Set();

    // Semi-finals: single SF from 2004–2007, two SFs from 2008 onward
    if (year >= 2008) {
      const sf1 = await scrapeEvent(year, 'SF1', '/semi-final-1');
      const sf2 = await scrapeEvent(year, 'SF2', '/semi-final-2');
      (sf1 || []).forEach(c => allForYear.add(c));
      (sf2 || []).forEach(c => allForYear.add(c));
    } else if (year >= 2004) {
      const sf1 = await scrapeEvent(year, 'SF1', '/semi-final');
      (sf1 || []).forEach(c => allForYear.add(c));
    }
    const final = await scrapeEvent(year, 'Final', '');
    (final || []).forEach(c => allForYear.add(c));

    if (allForYear.size > 0) {
      process.stdout.write(`  ${year} AllSongs ... `);
      const sorted = Array.from(allForYear).sort();
      await putToFirebase(`/catalog/${year}/AllSongs.json`, { countries: sorted });
      console.log(`${sorted.length} countries saved`);
    }
  }

  console.log('\nDone!');
}

if (require.main === module) {
  if (process.argv[2] === '--asia') {
    const year = +process.argv[3] || new Date().getFullYear();
    scrapeAsiaEvent(year).then(() => console.log('\nDone!')).catch(console.error);
  } else {
    main().catch(console.error);
  }
}

module.exports = { COUNTRY_NAMES, fetchUrl, putToFirebase, patchToFirebase, sleep };
