# Incremental Change Plan — StagePass

Every change lives on its own branch, gets reviewed as a PR, and is merged to `main` only after approval. Commits within a branch are atomic — one logical change per commit.

**Estimated total time with AI: ~6 hours**
**Without AI: 2–3 days**

---

## Git Workflow Rules

```
main                        ← protected, never commit directly
 └── chore/tooling-setup    ← branch per concern
      ├── commit 1 (atomic)
      ├── commit 2 (atomic)
      └── PR → reviewed → merged to main
```

**Branch naming:**
- `fix/`       — bug fixes
- `perf/`      — performance improvements
- `feat/`      — new features
- `refactor/`  — code quality, no behaviour change
- `test/`      — adding tests
- `chore/`     — tooling, config, infrastructure
- `ci/`        — CI/CD pipeline

**PR review checklist (apply to every PR):**
- [ ] Does the change do exactly what the branch name says and nothing more?
- [ ] Are there no unrelated changes bundled in?
- [ ] Do all existing tests still pass?
- [ ] Does the commit message follow the format below?
- [ ] Is there no commented-out code, no `console.log`, no `TODO` left behind?

**Commit message format:**
```
<type>(<scope>): <short summary>

<optional body — what and why, not how>
```

---

## Time Estimate Breakdown

| Branch | Est. Time (with AI) |
|--------|---------------------|
| `chore/tooling-setup` | 30 min |
| `fix/null-crashes` | 20 min |
| `fix/error-boundary` | 15 min |
| `perf/search` | 15 min |
| `fix/auth-security` | 45 min |
| `feat/memoria-ui` | 2 hrs |
| `refactor/code-quality` | 30 min |
| `test/unit` | 45 min |
| `test/integration` | 30 min |
| `test/e2e` | 30 min |
| `ci/github-actions` | 20 min |
| `chore/docker` | 20 min |
| **Total** | **~6 hrs** |

---

## Branch 1 — `chore/tooling-setup`

> Goal: establish a quality baseline before touching any product code.

### Commits

**Commit 1**
```
chore(lint): add ESLint with TypeScript support

- eslint.config.js at root
- @eslint/js + typescript-eslint
- Warns on @typescript-eslint/no-explicit-any and no-non-null-assertion
```

**Commit 2**
```
chore(lint): add eslint-plugin-sonarjs

Catches cognitive complexity violations, duplicated strings,
no-identical-expressions, no-ignored-return — equivalent to
running a local Sonar scan without needing a server.
```

**Commit 3**
```
chore(format): add Prettier config

.prettierrc — singleQuote, semi, tabWidth 2, trailingComma es5
```

**Commit 4**
```
chore(scripts): add lint, lint:fix, format scripts to root package.json

Also runs pnpm lint and saves output to docs/lint-baseline.txt
for before/after comparison in the workshop.
```

### Running Sonar locally

**Option A — eslint-plugin-sonarjs (no server, zero setup)**
```bash
pnpm lint
# Flags cognitive complexity, code smells, duplicated blocks
```

**Option B — SonarQube via Docker (full UI at localhost:9000)**
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
# Wait ~60s, then:
npx sonar-scanner \
  -Dsonar.projectKey=stagepass \
  -Dsonar.sources=packages/web/src,packages/server/src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=admin \
  -Dsonar.password=admin
```

### PR title
`chore: add ESLint, SonarJS, and Prettier — establish quality baseline`

### Tests added
None. Tooling only.

---

## Branch 2 — `fix/null-crashes`

> Goal: fix all three null-related crashes. One commit per crash.

### Commits

**Commit 1**
```
fix(MovieDetail): null-check cast_members before calling .split()

cast_members is null for "Untitled Project X". Calling .split()
on null throws a TypeError that white-screens the entire app.
Render "Cast information unavailable" when null.
```
- File: `packages/web/src/pages/MovieDetail.tsx`
- Change: `movie.cast_members?.split(',').join(' | ') ?? 'Cast information unavailable'`

**Commit 2**
```
fix(MovieDetail): null-check synopsis before accessing .length

synopsis is null for unreleased movies. Accessing .length on null
throws. Use optional chaining and a fallback string instead.
```
- File: `packages/web/src/pages/MovieDetail.tsx`
- Change: `movie.synopsis ?? 'No synopsis available.'`

**Commit 3**
```
fix(MyBookings): set loading false regardless of bookings array length

setLoading(false) was inside if (data.length > 0), so a user with
no bookings would see an infinite spinner. Moved outside the guard.
```
- File: `packages/web/src/pages/MyBookings.tsx`
- Change: Move `setLoading(false)` after `setBookings(data)`, unconditionally.

**Commit 4**
```
fix(SeatSelection): replace state mutation with immutable array operations

selectedSeats.splice() and .push() mutate the array in place.
React uses reference equality — the same array reference means no
re-render, so seats visually stay selected after deselect.
Replace with filter() and spread to always produce a new array.
```
- File: `packages/web/src/pages/SeatSelection.tsx`
- Change:
  ```ts
  // Remove:
  selectedSeats.splice(index, 1);
  setSelectedSeats(selectedSeats);

  // Add:
  setSelectedSeats(prev => prev.filter(id => id !== seatId));
  // and for adding:
  setSelectedSeats(prev => [...prev, seatId]);
  ```

### PR title
`fix: resolve null crashes and seat selection state mutation`

### Tests added (unit — Vitest + React Testing Library)
```
packages/web/src/pages/__tests__/
  MovieDetail.test.tsx
    ✓ renders "Cast information unavailable" when cast_members is null
    ✓ renders "No synopsis available" when synopsis is null
    ✓ does not throw when movie has all null optional fields

  MyBookings.test.tsx
    ✓ shows empty state text when API returns empty array
    ✓ loading spinner is not visible after empty response

  SeatSelection.test.tsx
    ✓ selecting a seat adds it to selectedSeats
    ✓ selecting the same seat again removes it
    ✓ state array is a new reference after each toggle (no mutation)
```

---

## Branch 3 — `fix/error-boundary`

> Goal: prevent any future unhandled render errors from white-screening the app.

### Commits

**Commit 1**
```
feat(ErrorBoundary): add ErrorBoundary component

Class component that catches render errors in the tree below it
and shows a user-friendly fallback with a "Reload page" button.
```
- File: `packages/web/src/components/ErrorBoundary.tsx` (new)

**Commit 2**
```
fix(App): wrap route tree with ErrorBoundary

Any page crash now shows the fallback UI instead of a blank screen.
```
- File: `packages/web/src/App.tsx`

### PR title
`fix: add ErrorBoundary to prevent full app crashes`

### Tests added (unit)
```
packages/web/src/components/__tests__/
  ErrorBoundary.test.tsx
    ✓ renders children normally when no error occurs
    ✓ renders fallback UI when a child component throws
    ✓ fallback contains a reload button
```

---

## Branch 4 — `perf/search`

> Goal: eliminate the 2-second UI freeze on search.

### Commits

**Commit 1**
```
perf(Home): remove blocking while loop from search filter

The while(Date.now() - start < 2000) loop blocked the main thread
for 2 seconds on every keystroke. Removed entirely — the actual
.filter() operation is instant.
```
- File: `packages/web/src/pages/Home.tsx`

**Commit 2**
```
perf(Home): memoize filtered movies, debounce search input

- useMemo on filteredMovies — recomputes only when movies/search/genre change
- useCallback on handlers — stable references across renders
- 300ms debounce on search input to avoid filtering on every keystroke
```
- File: `packages/web/src/pages/Home.tsx`

### PR title
`perf: fix blocking search and add memoisation to Home page`

### Tests added (unit)
```
packages/web/src/pages/__tests__/
  Home.test.tsx
    ✓ search input does not block the UI (completes in < 50ms)
    ✓ filters movies by title substring match
    ✓ filters movies by genre
    ✓ returns all movies when search and genre are empty
    ✓ combining search and genre returns correct intersection
```

---

## Branch 5 — `fix/auth-security`

> Goal: harden authentication. One concern per commit.

### Commits

**Commit 1**
```
chore(server): add dotenv support and .env.example

All environment variables now read from .env. .env added to
.gitignore. .env.example documents required vars with safe defaults.
```
- New file: `.env.example`
- Update: `packages/server/src/index.ts` — load dotenv at startup

**Commit 2**
```
fix(auth): move JWT secret to environment variable

Hardcoded 'stagepass-secret-key-not-secure' replaced with
process.env.JWT_SECRET. Server throws on startup if not set.
```
- File: `packages/server/src/routes/auth.ts`

**Commit 3**
```
fix(auth): hash passwords with bcrypt on signup and compare on login

Passwords were stored and queried as plain text. Now:
- signup: bcrypt.hash(password, 10) before INSERT
- login: fetch user by email only, then bcrypt.compare()
```
- File: `packages/server/src/routes/auth.ts`

**Commit 4**
```
fix(auth): add rate limiting on auth endpoints

express-rate-limit: max 10 requests per 15 minutes on /api/auth/*.
Returns 429 with a descriptive message when limit is exceeded.
```
- File: `packages/server/src/index.ts`

**Commit 5**
```
fix(server): add zod validation on all request bodies

Malformed or missing fields now return 400 with a descriptive
validation error instead of crashing or producing undefined behaviour.
Schemas added for: login, signup, create booking.
```
- Files: `packages/server/src/routes/auth.ts`, `bookings.ts`

**Commit 6**
```
fix(AuthContext): persist token to localStorage, rehydrate on mount

Token and user were stored only in React state — a page refresh
logged the user out. Now persisted to localStorage and rehydrated
when the app mounts.
```
- File: `packages/web/src/AuthContext.tsx`

### PR title
`fix: harden auth — bcrypt passwords, env secrets, rate limiting, input validation`

### Tests added (unit + integration)
```
packages/server/src/routes/__tests__/
  auth.test.ts
    ✓ POST /login returns 200 + JWT with correct credentials
    ✓ POST /login returns 401 with wrong password
    ✓ POST /login returns 400 when email is missing (zod)
    ✓ POST /login returns 400 when password is missing (zod)
    ✓ POST /signup stores a bcrypt hash, not the plain text password
    ✓ POST /signup returns 400 on duplicate email
    ✓ POST /login returns 429 after 10 requests in 15 minutes

packages/web/src/__tests__/
  AuthContext.test.tsx
    ✓ token is written to localStorage after login
    ✓ user is restored from localStorage on mount
    ✓ localStorage is cleared on logout
```

---

## Branch 6 — `feat/memoria-ui`

> Goal: apply the Memoria dark design system. One commit per page.

Install first:
```bash
pnpm --filter @stagepass/web add framer-motion
```

### Commits

**Commit 1**
```
feat(ui): apply Memoria global theme — dark base, remove legacy CSS

- bg-neutral-950 as app background in index.css
- Remove all hand-written CSS classes from index.css
- Update tailwind.config.js with neutral colour extension
```

**Commit 2**
```
feat(ui): extract Header into its own component with Memoria styling

- New file: packages/web/src/components/Header.tsx
- bg-neutral-950 border-b border-neutral-800
- Active route highlight, logout button as ghost variant
```

**Commit 3**
```
feat(ui): apply Memoria design to Home page

- Dark movie card grid: bg-neutral-900/60, border-neutral-800, rounded-xl
- Rating as hero number: text-3xl font-light text-white
- Staggered card entry animation via framer-motion
- Search: bg-neutral-900/80 border-neutral-800 focus:border-neutral-600
- Genre pills: bg-neutral-800 rounded-full uppercase tracking-widest
```

**Commit 4**
```
feat(ui): apply Memoria design to MovieDetail page

- Blur-in page transition on mount
- Poster with subtle 3D glare on hover
- Showtime pills: bg-neutral-800 hover:border-neutral-600
- Price as hero number per showtime
- Date selector as pill row with active state
```

**Commit 5**
```
feat(ui): apply Memoria design to SeatSelection page

- Full dark background
- Available: bg-neutral-700, Selected: bg-white text-black
- Booked: bg-neutral-800 opacity-40 cursor-not-allowed
- Thin centered SCREEN indicator
- Total amount as hero number in booking summary
```

**Commit 6**
```
feat(ui): apply Memoria design to MyBookings page

- Dark booking cards: bg-neutral-900/60 border-neutral-800 rounded-xl
- Total amount as hero number: text-3xl font-light text-white
- Movie title, venue, date as text hierarchy (white → neutral-400)
- Empty state: muted icon, title, description centered
```

**Commit 7**
```
feat(ui): apply Memoria design to BookingConfirmation page

- Spring-based modal entry animation (scale + rotateX)
- Booking ID as hero number
- Subtle border-beam effect on confirmation card
```

### PR title
`feat: apply Memoria dark design system across all pages`

### Tests added (snapshot)
```
packages/web/src/pages/__tests__/
  Home.test.tsx
    ✓ snapshot: movie card contains correct Tailwind dark classes
  MyBookings.test.tsx
    ✓ snapshot: booking amount renders as hero number
  MovieDetail.test.tsx
    ✓ snapshot: showtime pill renders with dark styling
```

---

## Branch 7 — `refactor/code-quality`

> Goal: improve type safety and remove magic values. No behaviour changes.

### Commits

**Commit 1**
```
refactor(server): replace req: any with typed Express interfaces

All route handlers now use typed Request/Response. Custom
AuthenticatedRequest interface extends Request with userId: number.
```
- Files: `packages/server/src/routes/*.ts`

**Commit 2**
```
refactor(server): extract magic strings and numbers to constants.ts

Venue names, seat rows, seats per row, and price tiers are now
imported from a single constants file instead of scattered inline.
```
- New file: `packages/server/src/constants.ts`

**Commit 3**
```
refactor(seed): add production environment guard

Running the seed script against a production database would wipe
all data. Now throws with a clear error if NODE_ENV=production.
```
- File: `packages/server/src/seed.ts`

### PR title
`refactor: improve type safety, extract constants, guard seed script`

### Tests added
None — refactor only. All existing tests must still pass.

---

## Branch 8 — `test/unit`

> Goal: unit test coverage for all critical components and route handlers.
> Dependencies: all fix/* and refactor/* branches must be merged first.

### Commits

**Commit 1**
```
test(web): add unit tests for all page components

Coverage: Home filter logic, MovieDetail null handling,
SeatSelection state immutability, MyBookings empty/loading states,
Login form validation, ErrorBoundary fallback rendering.
```

**Commit 2**
```
test(server): add unit tests for all route handlers

Coverage: movies filter/search/404, auth login/signup/errors,
bookings auth guard and seat marking logic.
```

**Commit 3**
```
test(web): add unit tests for AuthContext

Coverage: login, signup, logout, localStorage persistence,
rehydration on mount.
```

### PR title
`test: add unit tests for web components and server route handlers`

### Tests added (unit — Vitest + RTL + Supertest)
```
packages/web/src/pages/__tests__/
  Home.test.tsx           — filter logic, search, genre
  MovieDetail.test.tsx    — null fields, showtime grouping
  SeatSelection.test.tsx  — toggle immutability, price calculation
  MyBookings.test.tsx     — empty state, loading state, list render
  Login.test.tsx          — form validation, error display

packages/web/src/__tests__/
  AuthContext.test.tsx    — login, signup, logout, localStorage

packages/server/src/routes/__tests__/
  movies.test.ts          — genre filter, search, 404
  auth.test.ts            — login/signup happy + error paths, rate limit
  bookings.test.ts        — auth guard, seat booking, amount
```

---

## Branch 9 — `test/integration`

> Goal: test full request/response cycles against a real in-memory SQLite DB.
> Dependencies: `test/unit` merged.

### Commits

**Commit 1**
```
test(server): add integration tests for the full booking flow

Tests the complete chain: signup → login → browse movies →
get showtimes → get seats → POST booking → verify seats booked in DB.
Uses a separate in-memory SQLite DB — does not touch stagepass.db.
```

**Commit 2**
```
test(server): add integration tests for the auth flow

Verifies: password is hashed in DB, JWT is valid, protected routes
accept/reject tokens, expired tokens return 403.
```

### PR title
`test: add integration tests for booking and auth flows`

### Tests added (integration — Vitest + Supertest)
```
packages/server/src/__tests__/
  booking-flow.test.ts
    ✓ full booking: signup → login → get movies → book seats
    ✓ booked seats are marked is_booked=1 in DB after booking
    ✓ booking without token returns 401
    ✓ booking with invalid token returns 403

  auth-flow.test.ts
    ✓ signup stores bcrypt hash, not plain text
    ✓ login returns a valid signed JWT
    ✓ protected route returns 200 with valid token
    ✓ protected route returns 403 with expired token
```

---

## Branch 10 — `test/e2e`

> Goal: full user journey tests in a real browser.
> Dependencies: `test/integration` merged, app running.

### Commits

**Commit 1**
```
test(e2e): add Playwright config and browse/book user journey

playwright.config.ts configured for local dev server.
browse-and-book.spec.ts covers: browse, filter, search, view detail,
select showtime, select seats, confirm booking, verify in My Bookings.
```

**Commit 2**
```
test(e2e): add auth and error state e2e tests

auth.spec.ts: signup, login, redirect when unauthenticated, persist
across page refresh.
error-states.spec.ts: Untitled Project X shows graceful fallback,
empty bookings shows empty state not spinner.
```

### PR title
`test: add Playwright e2e tests for browse/book, auth, and error states`

### Tests added (e2e — Playwright)
```
e2e/
  browse-and-book.spec.ts
    ✓ home page shows movie grid
    ✓ genre filter shows only matching movies
    ✓ search returns matching movies
    ✓ clicking a movie opens detail page
    ✓ selecting a showtime opens seat grid
    ✓ selecting seats updates the total price
    ✓ logged-in user can complete a booking end-to-end
    ✓ completed booking appears in My Bookings

  auth.spec.ts
    ✓ new user can sign up
    ✓ existing user can log in
    ✓ unauthenticated access to /bookings redirects to /login
    ✓ session persists after page refresh

  error-states.spec.ts
    ✓ Untitled Project X shows graceful error state, not a blank screen
    ✓ new user My Bookings page shows empty state, not an infinite spinner
```

---

## Branch 11 — `ci/github-actions`

> Goal: automate lint, tests, and Sonar scan on every push and PR.
> Dependencies: all test/* branches merged.

### Commits

**Commit 1**
```
ci: add GitHub Actions workflow for lint and unit/integration tests

Jobs: install → lint → test:coverage
Runs on push to main and on all pull requests.
```

**Commit 2**
```
ci: add e2e job to GitHub Actions workflow

Spins up the full stack (server + web), waits for readiness,
then runs Playwright tests.
```

**Commit 3**
```
ci: add SonarQube scan job to GitHub Actions workflow

Runs after test:coverage to upload coverage report.
Requires SONAR_TOKEN secret.
```

### PR title
`ci: add GitHub Actions pipeline — lint, test, sonar, e2e`

### Tests added
None — CI only runs existing tests.

---

## Branch 12 — `chore/docker`

> Goal: containerise the app for consistent local and production runs.
> Dependencies: `ci/github-actions` merged.

### Commits

**Commit 1**
```
chore(docker): add Dockerfile for server

Multi-stage build. Runs as non-root user. Exposes port 3001.
```

**Commit 2**
```
chore(docker): add Dockerfile for web

Multi-stage: Vite build in node:20-alpine, served by nginx:alpine.
Exposes port 80.
```

**Commit 3**
```
chore(docker): add docker-compose for full-stack local run

docker-compose.yml starts server + web with correct env vars
and a named volume for the SQLite database file.
```

### PR title
`chore: add Dockerfiles and docker-compose for server and web`

### Tests added
None.

---

## Full Branch and PR Order

```
 1. chore/tooling-setup         →  PR: "chore: add ESLint, SonarJS, and Prettier"
 2. fix/null-crashes            →  PR: "fix: resolve null crashes and state mutation"
 3. fix/error-boundary          →  PR: "fix: add ErrorBoundary to prevent app crashes"
 4. perf/search                 →  PR: "perf: fix blocking search, add memoisation"
 5. fix/auth-security           →  PR: "fix: harden auth — bcrypt, env, rate limit, zod"
 6. feat/memoria-ui             →  PR: "feat: apply Memoria design system"
 7. refactor/code-quality       →  PR: "refactor: types, constants, seed guard"
 8. test/unit                   →  PR: "test: unit tests for components and routes"
 9. test/integration            →  PR: "test: integration tests for booking and auth"
10. test/e2e                    →  PR: "test: Playwright e2e tests"
11. ci/github-actions           →  PR: "ci: GitHub Actions pipeline"
12. chore/docker                →  PR: "chore: Dockerfiles and docker-compose"
```

---

## Test Type Summary

| Type | Tool | Scope | Count |
|------|------|-------|-------|
| Unit | Vitest + RTL | Single component or handler, all deps mocked | ~25 |
| Integration | Vitest + Supertest | API + real DB, no mocks | ~10 |
| E2E | Playwright | Full browser, full stack, real user flows | ~15 |
| Snapshot | Vitest + RTL | Design system class regressions | ~5 |
| **Total** | | | **~55** |

### Coverage Targets

| Package | Lines | Branches |
|---------|-------|----------|
| `server` | ≥ 70% | ≥ 60% |
| `web` | ≥ 60% | ≥ 50% |
