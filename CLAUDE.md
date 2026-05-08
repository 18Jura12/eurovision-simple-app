# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

**Finale** is a private Eurovision Song Contest voting app. Users drag-and-drop rank competing countries, votes persist in Firebase Realtime Database, and results display with Eurovision-style tiebreaker scoring. Supports all years 2000–present, semi-finals (SF1/SF2), and grand finals.

## Commands

```bash
npx ng serve          # Dev server at http://localhost:4200
ng build              # Build
npm run deploy        # Production build + Firebase hosting deploy
ng test               # Run unit tests (Karma + Jasmine)
eslint -c .eslintrc.js --ext .ts .  # Lint (note: .eslintrc.js may be missing)
node scripts/scrape-events.js       # Scrape full event catalog from eurovisionworld.com (all years)
npm run allsongs                    # Compute AllSongs from existing catalog and write to Firebase
npm run allsongs -- 2026            # Same, for a specific year only
node server.js        # Express server (production)
```

## Deployment Procedure

When adding a new year's events or changing how event data is structured in Firebase:

1. `node scripts/scrape-events.js` — fetch SF1/SF2/Final country lists from eurovisionworld.com
2. `npm run allsongs` — derive and write AllSongs entries from the scraped catalog
3. `npm run deploy` — build and deploy the Angular app to Firebase Hosting

For mid-season updates (e.g. adding AllSongs support to an already-scraped year):

1. `npm run allsongs -- <year>` — update just that year's AllSongs entry
2. `npm run deploy`

## Architecture

### Routing
```
/login   → LoginComponent
/vote    → VotingComponent (guarded by LoginGuard)
/result  → ResultComponent (public)
/admin   → AdminComponent
**       → redirect /login
```

### Key Services
- **`DataStorageService`** (`shared/`) — All Firebase HTTP REST calls. Votes are stored via `http.put()` per user node to avoid race conditions. Base path is `{year}/{event}` from EventService.
- **`EventService`** (`shared/`) — Reads/writes the active event (`EventConfig`) from localStorage. All components derive their Firebase path from this.
- **`LoginService`** (`login/`) — localStorage-based user session (name only, no password).

### State
- **localStorage**: user session (LoginService), active event selection (EventService)
- **sessionStorage**: admin authentication flag (`admin_authed`)
- **Firebase Realtime DB**: all votes, event catalog, admin password hash
- No NgRx — simple service-based state is intentional for this small-scale app.

### Firebase Structure
```
/catalog/{year}/{event}/countries   ← participating countries (from scraper)
/votes/{year}/{event}/{user}        ← per-user vote map (country → rank)
/config/adminPasswordHash           ← SHA-256 hash for admin auth
```

### Voting Flow
1. User enters name at `/login` → saved to localStorage
2. `/vote` loads active event's country list from Firebase catalog
3. User drag-drops countries to rank them (Angular CDK `CdkDragDrop`)
4. On submit: reactive form values mapped to per-country vote numbers → `PUT` to Firebase

### Results Scoring
Two modes:
- **Standard**: sum of all user votes per country
- **Jury mode**: exponential weight `12 * (0.827 ^ (place - 1))`

**5-level Eurovision tiebreaker** (in `result.component.ts`):
1. Total points
2. Highest place received (lowest rank number)
3. Count of votes for that highest place
4. Second-highest place received
5. Count of votes for that second-highest place

Results animate with interval-based incremental reveal (5s → 8s → 10s → 15s).

### Admin Panel
- `/admin` — SHA-256 client-side password check against Firebase-stored hash
- Lets operator switch the active year/event; writes to localStorage, app reloads
- No code change needed to switch between events

### Key Models
- `EventConfig` (`shared/event-config.ts`) — `{ year, event: 'SF1'|'SF2'|'Final'|'AllSongs', countries[] }`
- `SongDB` (`voting/voting.service.ts`) — Country with votes map, `getTotal()`, `getExpWeightTotal()`

## Tech Stack
- Angular 16, TypeScript
- Firebase 9 (Realtime Database + Hosting)
- Angular CDK drag-drop
- Bootstrap 5 + Bootstrap Icons
- Less for stylesheets
- ngx-toastr for notifications
- flag-icon-css for country flags
