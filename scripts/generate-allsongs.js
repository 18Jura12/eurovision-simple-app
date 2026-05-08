#!/usr/bin/env node
/**
 * Reads the existing catalog from Firebase (SF1/SF2/Final entries) and writes
 * an AllSongs entry for each year containing the sorted union of all countries.
 *
 * Run this after scraping new event data or after adding the AllSongs feature
 * for the first time:
 *
 *   node scripts/generate-allsongs.js          # all years
 *   node scripts/generate-allsongs.js 2026     # single year
 */

const https = require('https');

const FIREBASE_URL = 'https://sm-euro-default-rtdb.europe-west1.firebasedatabase.app';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    https.get({ hostname: parsed.hostname, path: parsed.pathname + parsed.search }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function putToFirebase(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const parsed = new URL(`${FIREBASE_URL}${path}`);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
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

async function main() {
  const targetYear = process.argv[2] || null;

  console.log('Fetching catalog from Firebase...');
  const { status, body } = await fetchUrl(`${FIREBASE_URL}/catalog.json`);
  if (status !== 200) {
    console.error(`Failed to fetch catalog (HTTP ${status})`);
    process.exit(1);
  }

  const catalog = JSON.parse(body);
  if (!catalog) {
    console.error('Catalog is empty — run the scraper first: node scripts/scrape-events.js');
    process.exit(1);
  }

  const years = targetYear ? [targetYear] : Object.keys(catalog).sort();

  for (const year of years) {
    const events = catalog[year];
    if (!events) { console.log(`  ${year}: no catalog data, skipping`); continue; }

    const all = new Set();
    for (const [eventName, eventData] of Object.entries(events)) {
      if (eventName === 'AllSongs') continue;
      for (const country of eventData.countries || []) {
        all.add(country);
      }
    }

    if (all.size === 0) { console.log(`  ${year}: no countries found, skipping`); continue; }

    const countries = Array.from(all).sort();
    process.stdout.write(`  ${year} AllSongs (${countries.length} countries) ... `);
    await putToFirebase(`/catalog/${year}/AllSongs.json`, { countries });
    console.log('saved');
  }

  console.log('\nDone!');
}

main().catch(console.error);
