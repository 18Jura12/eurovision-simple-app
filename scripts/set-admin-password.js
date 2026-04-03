#!/usr/bin/env node
/**
 * Sets the admin password hash in Firebase.
 * Usage: node scripts/set-admin-password.js <password>
 */

const { createHash } = require('crypto');
const https = require('https');

const FIREBASE_URL = 'https://sm-euro-default-rtdb.europe-west1.firebasedatabase.app';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/set-admin-password.js <password>');
  process.exit(1);
}

const hash = createHash('sha256').update(password).digest('hex');

const body = JSON.stringify(hash);
const parsed = new URL(`${FIREBASE_URL}/config/adminPasswordHash.json`);

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
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('Admin password hash stored in Firebase.');
    } else {
      console.error('Firebase error:', res.statusCode, data);
    }
  });
});

req.on('error', err => console.error('Request error:', err.message));
req.write(body);
req.end();
