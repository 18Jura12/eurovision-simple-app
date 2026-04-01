# Finale — Eurovision Voting App

A private Eurovision Song Contest voting app for a group of friends. Supports all years from 2000
onward, both semi-finals and the grand final. Built with Angular 16 and Firebase.

## Features
- Drag-and-drop country ranking (1st–last place)
- Per-user votes stored in Firebase with no race conditions
- Animated results reveal with Eurovision-style tiebreaker scoring
- Jury mode (exponential weighted scoring)
- Admin panel to switch the active year/event without touching code
- Event catalog auto-populated by scraping eurovisionworld.com

## Tech stack
- Angular 16
- Firebase Realtime Database (votes + event catalog)
- Firebase Hosting
- Angular CDK drag-drop
- Bootstrap 5

## Prerequisites
- Node.js 16 via nvm: `nvm install 16 && nvm use 16`
- Firebase CLI: `npm install -g firebase-tools`

## Getting started

```bash
npm install
npx ng serve    # dev server at http://localhost:4200
```

## Switching the active event

Open `/admin` in the app to pick any year/event from the catalog. The selection is stored in
`localStorage` and the app reloads using those countries automatically.

To set a default fallback (used when no admin selection has been made), edit
`src/app/shared/event-config.ts`:

```typescript
export const ACTIVE_EVENT: EventConfig = {
  year: 2025,
  event: 'SF2',
  countries: ['Australia', 'Montenegro', ...]
};
```

## Event catalog

Populate the Firebase catalog by scraping eurovisionworld.com (2000–present):

```bash
node scripts/scrape-events.js
```

Re-run whenever a new year's data becomes available. Countries are stored under
`/catalog/{year}/{event}/countries` and never overwrite vote data.

## Deployment

```bash
npm run deploy   # production build → Firebase Hosting
```

## Firebase data structure

```
/catalog/{year}/{event}/countries   ← participating countries per event (from scraper)
/votes/{year}/{event}/{user}        ← per-user votes, keyed by country name
```

Each user's vote is a direct `PUT` to their own node — no read-modify-write race conditions,
no user can accidentally overwrite another's vote.
