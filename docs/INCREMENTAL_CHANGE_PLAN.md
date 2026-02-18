# Incremental Change Plan — StagePass

A step-by-step guide to improving the codebase with AI assistance.
Each step has a clear scope, a commit, and specifies exactly what tests are added.

**Estimated total time with AI: 5-6 hours**
**Without AI: 2-3 days**

---

## Time Estimate Breakdown

| Phase | What | Est. Time (with AI) |
|-------|------|---------------------|
| 1 | Tooling — ESLint, SonarJS, Prettier | 30 min |
| 2a | Fix crashes & state bugs | 30 min |
| 2b | Fix performance issues | 20 min |
| 2c | Fix security issues | 45 min |
| 2d | Apply Memoria design system | 2 hrs |
| 2e | Code quality cleanup | 30 min |
| 3 | Tests — unit, integration, e2e | 1.5 hrs |
| 4 | CI pipeline | 20 min |
| 5 | Docker + deployment | 20 min |
| **Total** | | **~6 hrs** |

---

## Step 1 — Tooling Baseline
**Commit: `chore: add ESLint, SonarJS, Prettier`**

### What changes
- Add ESLint with TypeScript support
- Add `eslint-plugin-sonarjs` for local Sonar-equivalent rules
- Add Prettier
- Run first lint pass and save output as baseline

### Packages to install
```bash
pnpm add -Dw eslint @eslint/js typescript-eslint eslint-plugin-sonarjs prettier
```

### Files to create
- `eslint.config.js` — root ESLint config with sonarjs rules enabled
- `.prettierrc` — formatting config
- `docs/lint-baseline.txt` — output of first `pnpm lint` run (saved for before/after comparison)

### Running Sonar locally — two options

**Option A: eslint-plugin-sonarjs (no server needed, recommended for workshop)**
```bash
pnpm lint
# Flags: cognitive complexity, code duplication, empty catch blocks,
# no-identical-expressions, no-ignored-return, etc.
```

**Option B: SonarQube via Docker (gives the full dashboard UI)**
```bash
# Start SonarQube locally
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community

# Wait ~60s for it to boot, then scan
npx sonar-scanner \
  -Dsonar.projectKey=stagepass \
  -Dsonar.sources=packages/web/src,packages/server/src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=admin \
  -Dsonar.password=admin

# View results at http://localhost:9000
```

### Scripts to add to root `package.json`
```json
"lint": "eslint 'packages/*/src/**/*.{ts,tsx}'",
"lint:fix": "eslint 'packages/*/src/**/*.{ts,tsx}' --fix",
"format": "prettier --write 'packages/*/src/**/*.{ts,tsx}'"
```

### Tests added this step
None. This step is pure tooling.

### Commit message
```
chore: add ESLint, SonarJS, Prettier — quality baseline

- eslint-plugin-sonarjs catches cognitive complexity, code smells
- TypeScript-ESLint flags any types and non-null assertions
- Prettier enforces consistent formatting
- Baseline lint output saved to docs/lint-baseline.txt
```

---

## Step 2a — Fix Crashes & State Bugs
**Commit: `fix: resolve all crash bugs and state mutation issues`**

### What changes

**`packages/web/src/pages/MovieDetail.tsx`**
- Null-check `cast_members` before calling `.split()`
- Null-check `synopsis` before accessing `.length`
- Add null-check on `movie` itself before rendering

**`packages/web/src/pages/SeatSelection.tsx`**
- Replace `selectedSeats.splice()` mutation with `filter()`
- Replace `selectedSeats.push()` with `[...selectedSeats, seatId]`

**`packages/web/src/pages/MyBookings.tsx`**
- Move `setLoading(false)` outside the `if (data.length > 0)` guard

**`packages/web/src/App.tsx`**
- Add a React `ErrorBoundary` component wrapping the route tree
- Shows a user-friendly fallback instead of a blank white screen

### Tests added this step

**Type:** Unit tests (Vitest + React Testing Library)

```
packages/web/src/pages/__tests__/
  MovieDetail.test.tsx     — renders without crash when cast/synopsis are null
  SeatSelection.test.tsx   — toggleSeat adds seat; toggling again removes it (no mutation)
  MyBookings.test.tsx      — shows empty state (not spinner) when bookings array is empty
  ErrorBoundary.test.tsx   — renders fallback UI when a child throws
```

**What each test verifies:**
- `MovieDetail`: renders `"Cast information unavailable"` when `cast_members` is null; no unhandled exception
- `SeatSelection`: after calling `toggleSeat` twice on the same ID, the seat is not in `selectedSeats`; state array is a new reference each time
- `MyBookings`: when API returns `[]`, loading spinner is gone and "No bookings yet" text is visible
- `ErrorBoundary`: when wrapped component throws, fallback message renders instead of crash

### Commit message
```
fix: resolve all crash bugs and state mutation issues

- MovieDetail: null-check cast_members and synopsis (fixes white screen crash)
- SeatSelection: replace array mutation with immutable filter/spread
- MyBookings: setLoading(false) unconditionally (fixes infinite spinner)
- App: add ErrorBoundary to catch any future unhandled renders
```

---

## Step 2b — Fix Performance
**Commit: `perf: remove blocking search, add memoisation`**

### What changes

**`packages/web/src/pages/Home.tsx`**
- Delete the `while (Date.now() - start < 2000)` loop entirely
- Wrap `filteredMovies` computation in `useMemo`
- Wrap genre change and search handlers in `useCallback`
- Add debounce (300ms) to the search input

### Tests added this step

**Type:** Unit tests

```
packages/web/src/pages/__tests__/
  Home.test.tsx   (extend existing)
    — typing in search does not block for > 50ms
    — filteredMovies returns correct subset for a given search term
    — filteredMovies returns correct subset for a given genre
    — filteredMovies returns all movies when search and genre are empty
```

### Commit message
```
perf: remove blocking search, add memoisation

- Remove 2s while-loop that was freezing the UI on every keystroke
- useMemo on filteredMovies, useCallback on handlers
- 300ms debounce on search input
```

---

## Step 2c — Fix Security
**Commit: `fix: harden auth — bcrypt passwords, env secrets, rate limiting, zod validation`**

### What changes

**`packages/server/src/routes/auth.ts`**
- Replace plain text password storage with `bcrypt.hash()` on signup
- Replace plain text password query with `bcrypt.compare()` on login
- Move `JWT_SECRET` to `process.env.JWT_SECRET` (read from `.env`)

**`packages/server/src/index.ts`**
- Add `express-rate-limit` middleware: max 10 requests/15min on `/api/auth/*`

**`packages/server/src/routes/bookings.ts`, `movies.ts`**
- Add `zod` schema validation on all `req.body` inputs
- Return `400` with descriptive error if validation fails

**`packages/web/src/AuthContext.tsx`**
- Persist token and user to `localStorage` on login
- Rehydrate from `localStorage` on mount
- Clear `localStorage` on logout

**New files:**
- `.env.example` — documents required env vars
- `.env` — added to `.gitignore`

### Packages to install
```bash
pnpm --filter @stagepass/server add bcrypt dotenv express-rate-limit zod
pnpm --filter @stagepass/server add -D @types/bcrypt
```

### Tests added this step

**Type:** Unit + Integration tests

```
packages/server/src/routes/__tests__/
  auth.test.ts
    — POST /login with correct credentials returns 200 + JWT
    — POST /login with wrong password returns 401
    — POST /login with missing fields returns 400 (zod)
    — POST /signup hashes password — DB value !== plain text
    — POST /signup with duplicate email returns 400
    — POST /login is rate-limited after 10 requests

packages/web/src/__tests__/
  AuthContext.test.tsx
    — token is saved to localStorage after login
    — user is rehydrated from localStorage on mount
    — localStorage is cleared on logout
```

### Commit message
```
fix: harden auth — bcrypt, env vars, rate limiting, input validation

- bcrypt.hash on signup, bcrypt.compare on login (no more plain text passwords)
- JWT_SECRET read from .env — removed hardcoded string
- express-rate-limit on /api/auth/* endpoints
- zod validation on all request bodies, returns 400 on invalid input
- Auth token persisted to localStorage, rehydrated on page refresh
```

---

## Step 2d — Apply Memoria Design System
**Commit: `feat: apply Memoria design system across all pages`**

This is the biggest visual change. The entire frontend is restyled.

### What changes

**Global (`index.css`, `tailwind.config.js`)**
- Set `bg-neutral-950` as app background
- Remove all hand-written CSS classes
- Remove all inline `style={{}}` objects

**`packages/web/src/pages/Home.tsx`**
- Dark card grid: `bg-neutral-900/60 border border-neutral-800 rounded-xl`
- Rating as hero number: large, `font-light`, `text-white`
- Staggered card entry: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}`
- Search input styled: `bg-neutral-900/80 border-neutral-800 focus:border-neutral-600`
- Genre pills: `bg-neutral-800 rounded-full px-3 py-1 text-xs uppercase tracking-widest`

**`packages/web/src/pages/MovieDetail.tsx`**
- Split layout with page blur-in animation
- Showtimes as styled dark pill buttons with price as hero number
- Date selector as pill row

**`packages/web/src/pages/SeatSelection.tsx`**
- Full dark background
- Seat states: available (`bg-neutral-700`), selected (`bg-white text-black`), booked (`bg-neutral-800 opacity-40`)
- Screen label: thin line with label, centered

**`packages/web/src/pages/MyBookings.tsx`**
- Dark booking cards with `BorderBeam` on hover
- Total amount as hero number (`text-3xl font-light text-white`)
- Booking date as muted metadata

**`packages/web/src/pages/BookingConfirmation.tsx`**
- Centered layout, booking ID as large hero number
- Spring-based modal entry animation

**`packages/web/src/App.tsx` / `components/Header.tsx`**
- Extract `Header` to its own file
- Dark nav: `bg-neutral-950 border-b border-neutral-800`

### Packages to install
```bash
pnpm --filter @stagepass/web add framer-motion
```

### Tests added this step

**Type:** Snapshot / visual regression tests

```
packages/web/src/pages/__tests__/
  Home.test.tsx          — snapshot: movie card renders with correct Tailwind classes
  MovieDetail.test.tsx   — snapshot: showtime pill renders price correctly
  MyBookings.test.tsx    — snapshot: booking card shows amount as hero number
```

> Note: Full visual regression (Percy, Chromatic) is out of scope for this plan but these snapshots catch unintended class changes.

### Commit message
```
feat: apply Memoria design system across all pages

Dark monochromatic UI — bg-neutral-950 base, text hierarchy via opacity,
hero numbers, staggered animations via framer-motion.

- Home: dark card grid with staggered entry animation
- MovieDetail: split layout with blur-in, showtime pills
- SeatSelection: dark grid, white selected state, muted booked state
- MyBookings: booking cards with hero amount, BorderBeam on hover
- BookingConfirmation: spring modal entry, booking ID as hero number
- Header extracted to components/Header.tsx
- All inline styles replaced with Tailwind classes
```

---

## Step 2e — Code Quality Cleanup
**Commit: `refactor: replace any types, extract constants, add env config`**

### What changes

**`packages/server/src/routes/*.ts`**
- Replace `req: any` with typed Express `Request` + custom interface
- Replace `params: any[]` with typed arrays

**`packages/server/src/constants.ts`** (new file)
- Extract: seat rows, seats per row, price tiers, venue names

**`packages/server/src/seed.ts`**
- Add `if (process.env.NODE_ENV === 'production') throw new Error('Do not seed in production')`

**`packages/server/src/index.ts`**
- Load `dotenv` at startup
- Read `PORT` from env

### Tests added this step
None — refactor only. Existing tests must still pass.

### Commit message
```
refactor: replace any types, extract constants, guard seed script

- Typed Express routes — no more req: any
- Constants file for magic strings (venue names, seat rows, prices)
- Seed script throws if NODE_ENV === production
- dotenv loaded at server startup
```

---

## Step 3 — Tests
**Commit: `test: add full unit, integration and e2e test suites`**

### Setup

```bash
# Web
pnpm --filter @stagepass/web add -D vitest @testing-library/react @testing-library/jest-dom @vitest/coverage-v8 jsdom

# Server
pnpm --filter @stagepass/server add -D vitest supertest @types/supertest

# E2E
pnpm add -Dw @playwright/test
npx playwright install --with-deps chromium
```

### Unit Tests

These test a single function or component in isolation, with all dependencies mocked.

```
packages/web/src/pages/__tests__/
  Home.test.tsx             — filter logic, search debounce, genre selection
  MovieDetail.test.tsx      — null cast/synopsis, showtime grouping by date
  SeatSelection.test.tsx    — toggleSeat immutability, total price calculation
  MyBookings.test.tsx       — empty state, loading state, booking list render
  Login.test.tsx            — form validation, error message on failed login

packages/server/src/routes/__tests__/
  movies.test.ts            — genre filter, search filter, 404 on unknown id
  auth.test.ts              — login/signup happy path, error paths, rate limit
  bookings.test.ts          — auth guard, seat marking, total amount
```

### Integration Tests

These test multiple real layers together — the Express router + SQLite DB, no mocks.

```
packages/server/src/__tests__/
  booking-flow.test.ts
    — signup → login → get movies → get showtimes → get seats → book → confirm in DB
    — attempting to book already-booked seats returns 409
    — booking without token returns 401

  auth-flow.test.ts
    — signup creates hashed password in DB
    — login with correct credentials returns valid JWT
    — protected route accepts valid JWT
    — protected route rejects expired JWT
```

### E2E Tests

These run against the real running app (server + web) using Playwright.

```
e2e/
  browse-and-book.spec.ts
    — user can browse movie list
    — user can filter by genre
    — user can search for a movie by name
    — user can view movie detail page
    — user can select a showtime and see seat grid
    — user can select seats and see total price update
    — logged-in user can complete a booking
    — booking appears in My Bookings

  auth.spec.ts
    — user can sign up with new email
    — user can log in with existing credentials
    — user is redirected to login when accessing My Bookings unauthenticated
    — login persists across page refresh

  error-states.spec.ts
    — clicking Untitled Project X shows graceful error state (not white screen)
    — new user My Bookings shows empty state (not infinite spinner)
```

### Coverage Targets

| Package | Lines | Branches |
|---------|-------|----------|
| `server` | ≥ 70% | ≥ 60% |
| `web` | ≥ 60% | ≥ 50% |

### Scripts to add

```json
"test": "pnpm -r run test",
"test:coverage": "pnpm -r run test:coverage",
"test:e2e": "playwright test"
```

### Commit message
```
test: add unit, integration, and e2e test suites

Unit: component behaviour, route handlers in isolation
Integration: full booking flow, auth flow against real SQLite DB
E2E: Playwright — browse, search, book, auth flows

Server coverage: 72% lines, Web coverage: 63% lines
```

---

## Step 4 — CI Pipeline
**Commit: `ci: add GitHub Actions — lint, test, sonar, e2e`**

### What changes

**`.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm format --check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm test:coverage

  sonar:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm test:coverage
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: npx playwright install --with-deps chromium
      - run: pnpm seed
      - run: pnpm dev &
      - run: npx wait-on http://localhost:3000
      - run: pnpm test:e2e
```

### Tests added this step
None — CI only runs existing tests.

### Commit message
```
ci: add GitHub Actions pipeline

Jobs: lint → test (with coverage) → sonar scan → e2e (Playwright)
All jobs must pass before merging to main
```

---

## Step 5 — Docker + Deployment
**Commit: `chore: dockerise server and web, add docker-compose`**

### What changes
- `packages/server/Dockerfile`
- `packages/web/Dockerfile`
- `docker-compose.yml` at root
- `docker-compose.prod.yml` with env overrides for production

### Tests added this step
None — deployment infrastructure only.

### Commit message
```
chore: dockerise server and web

- Multi-stage build for web (Vite build → nginx)
- Server runs as non-root user
- docker-compose.yml for local full-stack run
- docker-compose.prod.yml for production overrides
```

---

## Full Commit Log (in order)

```
1. chore: add ESLint, SonarJS, Prettier — quality baseline
2. fix: resolve all crash bugs and state mutation issues
3. perf: remove blocking search, add memoisation
4. fix: harden auth — bcrypt, env vars, rate limiting, input validation
5. feat: apply Memoria design system across all pages
6. refactor: replace any types, extract constants, guard seed script
7. test: add unit, integration, and e2e test suites
8. ci: add GitHub Actions pipeline
9. chore: dockerise server and web
```

---

## Test Type Summary

| Type | Tool | What it tests | Count |
|------|------|---------------|-------|
| Unit | Vitest + RTL | Individual components and route handlers in isolation | ~20 tests |
| Integration | Vitest + Supertest | Full API flows against real SQLite DB | ~10 tests |
| E2E | Playwright | Real browser, real server, full user journeys | ~15 tests |
| Snapshot | Vitest + RTL | Design system class changes | ~5 tests |
| **Total** | | | **~50 tests** |
