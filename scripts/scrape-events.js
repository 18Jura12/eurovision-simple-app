#!/usr/bin/env node
/**
 * Scrapes participating countries from eurovisionworld.com for all years 2000-present
 * and stores them in Firebase under /catalog/{year}/{event}/countries
 *
 * Usage: node scripts/scrape-events.js
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

async function getVotingJsId(year, suffix) {
  const url = `https://eurovisionworld.com/eurovision/${year}${suffix}`;
  const { status, body } = await fetchUrl(url);
  if (status !== 200) return null;
  const match = body.match(/\/scripts\/js\/voting\/(\d+)\.js/);
  return match ? match[1] : null;
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

async function getCountriesFromVotingJs(jsId) {
  const { status, body } = await fetchUrl(`https://eurovisionworld.com/scripts/js/voting/${jsId}.js`);
  if (status !== 200) return [];

  const codes = extractArray(body, 'voting_table_main_arr') || [];
  return codes
    .filter(code => COUNTRY_NAMES[code] !== undefined && COUNTRY_NAMES[code] !== null)
    .map(code => COUNTRY_NAMES[code]);
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeEvent(year, eventName, urlSuffix) {
  process.stdout.write(`  ${year} ${eventName} ... `);
  try {
    const jsId = await getVotingJsId(year, urlSuffix);
    if (!jsId) { console.log('no voting JS found'); return null; }

    const countries = await getCountriesFromVotingJs(jsId);
    if (!countries.length) { console.log('no countries found'); return null; }

    await putToFirebase(`/catalog/${year}/${eventName}.json`, { countries });
    console.log(`${countries.length} countries saved`);
    await sleep(800);
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

main().catch(console.error);
