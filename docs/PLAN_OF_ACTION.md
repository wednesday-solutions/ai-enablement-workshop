# Plan of Action — StagePass SDLC Improvement

This document outlines the full plan to take the StagePass codebase from its current broken, untested, unstyled state to a production-ready standard. It is structured around the four SDLC phases: **Understand → Analyse → Fix → Test → Ship**.

---

## Phase 0: Understand the Codebase

> Goal: Get a full picture of what exists before touching anything.

### 0.1 Map the project structure

```
stagepass/
├── packages/
│   ├── common/        # Shared TypeScript types (Movie, Booking, Showtime, etc.)
│   ├── server/        # Express + SQLite REST API
│   │   └── src/
│   │       ├── db.ts              # SQLite schema + connection
│   │       ├── seed.ts            # Seed script (25 movies, 880+ showtimes)
│   │       ├── index.ts           # Express app entry
│   │       └── routes/
│   │           ├── auth.ts        # POST /login, POST /signup + JWT middleware
│   │           ├── movies.ts      # GET /movies, GET /movies/:id, GET /movies/meta/genres
│   │           ├── showtimes.ts   # GET /showtimes/movie/:id, GET /showtimes/:id
│   │           ├── seats.ts       # GET /seats/showtime/:id
│   │           └── bookings.ts    # GET /bookings, POST /bookings
│   └── web/           # React + Vite + Tailwind frontend
│       └── src/
│           ├── App.tsx            # Router, Header, AuthProvider wiring
│           ├── AuthContext.tsx    # JWT auth state (login, signup, logout)
│           └── pages/
│               ├── Home.tsx             # Movie grid + search + genre filter
│               ├── MovieDetail.tsx      # Poster, synopsis, showtime picker
│               ├── SeatSelection.tsx    # Interactive seat grid
│               ├── BookingConfirmation  # Post-booking confirmation screen
│               ├── MyBookings.tsx       # User's booking history
│               └── Login.tsx            # Login / signup form
├── ISSUES_IN_THE_CODEBASE.md   # Full catalogue of 33 known issues
└── docs/
    └── PLAN_OF_ACTION.md        # This document
```

### 0.2 Run the app and reproduce known issues

```bash
pnpm install
pnpm seed          # Creates stagepass.db with 25 movies, 880+ showtimes
pnpm dev           # Web: http://localhost:3000 | API: http://localhost:3001
```

**Issues to reproduce manually before starting fixes:**

| # | Where | How to trigger |
|---|-------|----------------|
| Bug 1 | Home → click "Untitled Project X" | App white-screens (null crash) |
| Bug 2 | Any movie → Select Seats → select then deselect a seat | Seat stays visually selected |
| Bug 3 | Login as new user → My Bookings | Infinite spinner |
| Perf 1 | Home page → type anything in search | UI freezes for 2 seconds |

### 0.3 Read ISSUES_IN_THE_CODEBASE.md

The full catalogue of 33 known issues is documented in [`docs/ISSUES_IN_THE_CODEBASE.md`](./ISSUES_IN_THE_CODEBASE.md). Review it in full before starting any work.

---

## Phase 1: State of Code — Tooling Setup

> Goal: Establish a quality baseline with linting and static analysis before making any fixes.

### 1.1 Add ESLint + TypeScript support

```bash
pnpm add -Dw eslint @eslint/js typescript-eslint
```

Create `eslint.config.js` at the root:

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    }
  }
)
```

### 1.2 Add eslint-plugin-sonarjs

Catches code smells that SonarQube would flag, runnable entirely locally without a server.

```bash
pnpm add -Dw eslint-plugin-sonarjs
```

Extend `eslint.config.js`:

```js
import sonarjs from 'eslint-plugin-sonarjs'

export default tseslint.config(
  ...
  sonarjs.configs.recommended,
)
```

Add lint script to root `package.json`:

```json
"lint": "eslint packages/*/src --ext .ts,.tsx"
```

Run it and capture the baseline:

```bash
pnpm lint 2>&1 | tee docs/lint-baseline.txt
```

### 1.3 Add Prettier

```bash
pnpm add -Dw prettier
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Add format script:

```json
"format": "prettier --write packages/*/src"
```

### 1.4 Static analysis — local Sonar

`eslint-plugin-sonarjs` (already added in 1.2) runs the same rules as SonarQube without a server. Use it as the primary Sonar gate.

**Option A — eslint-plugin-sonarjs (zero setup, recommended for local dev):**
```bash
pnpm lint
# Flags: cognitive complexity, no-identical-expressions, duplicated blocks, no-ignored-return
```

**Option B — Full SonarQube dashboard via Docker:**
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
# Wait ~60 seconds, then:
npx sonar-scanner \
  -Dsonar.projectKey=stagepass \
  -Dsonar.sources=packages/web/src,packages/server/src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=admin \
  -Dsonar.password=admin
# View at http://localhost:9000
```

**Expected initial findings:**
- Cognitive complexity violations (blocking while loop, nested conditionals)
- Security hotspots (hardcoded secret, plain text passwords)
- Code smells (magic strings, `any` types, missing error handling)
- Reliability bugs (null dereference, state mutation)

### 1.5 Set up Commitlint + Husky

Enforce commit message format and run quality checks automatically on every `git commit`.

```bash
pnpm add -Dw @commitlint/cli @commitlint/config-conventional husky
pnpm exec husky init
```

Create `commitlint.config.js` at root:
```js
export default { extends: ['@commitlint/config-conventional'] }
```

`.husky/pre-commit`:
```sh
pnpm lint
pnpm format --check
```

`.husky/commit-msg`:
```sh
pnpm exec commitlint --edit $1
```

### 1.6 Commit the quality baseline

```bash
git add eslint.config.js .prettierrc commitlint.config.js .husky package.json docs/lint-baseline.txt
git commit -m "chore: add ESLint, SonarJS, Prettier, Commitlint, Husky — quality baseline"
```

---

## Phase 2: Fix Plan

> Goal: Systematically fix issues in priority order — crashes first, then performance, then security, then quality.

> **Rule: every fix ships with unit and integration tests in the same PR.** A fix without a test is incomplete — the test proves the bug is gone and prevents regression. Only E2E tests are deferred to Phase 3. Set up Vitest + React Testing Library + Supertest before starting Phase 2 fixes (see Phase 3.1 setup below — do it first).

### Priority 1 — Crash Fixes (do these first, they block demos)

| Ref | File | Fix |
|-----|------|-----|
| 1.1 | `MovieDetail.tsx` | Null-check `cast_members` and `synopsis` before accessing |
| 1.2 | `SeatSelection.tsx` | Replace array mutation with `filter()` and spread `[...selectedSeats, id]` |
| 1.3 | `MyBookings.tsx` | Move `setLoading(false)` outside the `if (data.length > 0)` guard |
| 1.4 | All pages | Wrap fetch calls in try/catch, add `.catch()` handlers |
| 4.3 | `App.tsx` | Add a React `<ErrorBoundary>` wrapping the route tree |

### Priority 2 — Performance

| Ref | File | Fix |
|-----|------|-----|
| 2.1 | `Home.tsx` | Remove the blocking `while` loop; use simple `.filter()` |
| 2.3 | `Home.tsx` | Wrap filter logic in `useMemo`, wrap handlers in `useCallback` |
| 2.2 | `Home.tsx` | Add client-side pagination (show 12 at a time, "Load More") |

### Priority 3 — Security

| Ref | File | Fix |
|-----|------|-----|
| 3.1 | `auth.ts`, `seed.ts` | Add `bcrypt` — hash on signup, compare on login |
| 3.2 | `auth.ts` | Move JWT secret to `.env` via `dotenv` |
| 3.3 | All routes | Add `zod` schema validation on all request bodies |
| 3.5 | `auth.ts` | Add `express-rate-limit` on auth endpoints |
| 3.6 | `AuthContext.tsx` | Persist token to `localStorage`, rehydrate on mount |
| 4.6 | All | Add `.env` + `dotenv`, add `.env.example`, add `.env` to `.gitignore` |

### Priority 4 — Design System (Memoria)

> This is the "Write" phase showpiece. Transform the UI from ugly to polished.

Apply the [Memoria design system](https://gist.github.com/alichherawalla/8234538a50f9d089e0159c3e3634e17c) across all pages:

- **Global:** Switch to `bg-neutral-950` base, `text-white/neutral-*` hierarchy, no accent colors
- **Home:** Dark card grid with poster, rating as hero number, staggered entry animation
- **MovieDetail:** Split layout with blur-in animation, showtimes as styled pill buttons
- **SeatSelection:** Dark grid, green/red/blue seat states, screen label at top
- **MyBookings:** Timeline-style booking cards, booking amount as hero number
- **All modals/overlays:** `BorderBeam` effect, spring-based 3D entry animation

Install animation library:

```bash
pnpm --filter @stagepass/web add framer-motion
```

### Priority 5 — Code Quality

| Ref | Fix |
|-----|-----|
| 4.1 | Replace `any` with proper types throughout server routes |
| 4.2 | Extract magic strings/numbers into `constants.ts` |
| 4.4 | Remove all inline `style={{}}` — use Tailwind only |
| 4.5 | Move `Header` to its own file `components/Header.tsx` |
| 4.7 | Add `NODE_ENV` guard to seed script |

---

## Phase 3: Test Plan

> Goal: E2E test coverage only. Unit and integration tests were written alongside each Phase 2 fix — do not defer them here.

### 3.1 Setup Vitest (unit + integration)

```bash
pnpm --filter @stagepass/web add -D vitest @testing-library/react @testing-library/jest-dom @vitest/coverage-v8 jsdom
pnpm --filter @stagepass/server add -D vitest supertest @types/supertest
```

Add to each `package.json`:

```json
"test": "vitest run",
"test:coverage": "vitest run --coverage"
```

### 3.2 E2E tests (Playwright)

- Full booking flow in a real browser: browse → select showtime → select seats → confirm → verify booking appears in My Bookings
- Auth flows: signup, login, logout, session persists after page refresh
- Unauthenticated access redirects to login
- "Untitled Project X" renders gracefully (not blank screen)
- New user My Bookings shows empty state (not infinite spinner)

### 3.3 Coverage targets

| Package | Target |
|---------|--------|
| `server` | 70% line coverage |
| `web` | 60% line coverage |

Add coverage thresholds to `vitest.config.ts`:

```ts
coverage: {
  thresholds: { lines: 70 }
}
```

### 3.6 Commit tests

```bash
git add packages/*/src/**/*.test.ts packages/*/src/**/*.test.tsx
git commit -m "test: add unit and integration tests — 70% server coverage, 60% web"
```

---

## Phase 4: CI Pipeline

> Goal: Automate lint, test, and Sonar scan on every push.

### 4.1 GitHub Actions workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # needed for Sonar blame info

      - uses: pnpm/action-setup@v3
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Test with coverage
        run: pnpm -r test:coverage

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### 4.2 Add branch protection rule on GitHub

- Require CI to pass before merge
- Require at least 1 reviewer
- Block direct pushes to `main`

### 4.3 Add Sonar Quality Gate to PR checks

In SonarCloud project settings → Quality Gates → set as required status check on GitHub.

**Quality Gate conditions:**
- New coverage ≥ 60%
- New duplications ≤ 3%
- No new blocker/critical issues

---

## Phase 5: Deployment Plan

> Goal: Package and ship the app reliably.

### 5.1 Add environment config

```bash
pnpm --filter @stagepass/server add dotenv
```

Create `.env.example`:

```env
PORT=3001
JWT_SECRET=replace-with-a-long-random-string
DATABASE_PATH=./stagepass.db
NODE_ENV=development
```

### 5.2 Dockerise

Create `packages/server/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/
COPY packages/common/package.json ./packages/common/
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod
COPY packages/server/src ./packages/server/src
COPY packages/common/src ./packages/common/src
EXPOSE 3001
CMD ["node", "packages/server/dist/index.js"]
```

Create `packages/web/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter @stagepass/web build

FROM nginx:alpine
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html
EXPOSE 80
```

Create `docker-compose.yml` at root:

```yaml
version: '3.9'
services:
  server:
    build: ./packages/server
    ports:
      - "3001:3001"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    volumes:
      - ./data:/app/data

  web:
    build: ./packages/web
    ports:
      - "80:80"
    depends_on:
      - server
```

### 5.3 Add build + deploy to CI

Extend `.github/workflows/ci.yml` with a deploy job:

```yaml
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Build and push Docker images
        run: docker compose build && docker compose push
```

---

## Execution Order Summary

```
Phase 0  Understand       Read code, reproduce bugs, review docs/ISSUES_IN_THE_CODEBASE.md
Phase 1  Tooling          ESLint + SonarJS + Prettier + Commitlint + Husky; capture lint baseline
Phase 2  Fix              Crashes (2a) → ErrorBoundary (2b) → Performance (2c)
                          → Security (2d) → Memoria UI (2e) → Code Quality (2f)
Phase 3  Test             E2E Playwright only; unit + integration tests written in Phase 2 PRs
Phase 4  CI               GitHub Actions: lint → test → Sonar scan → quality gate
Phase 5  Deploy           Docker + docker-compose + deploy job in CI
```

---

## Done Definition

The codebase is considered "done" when:

- [ ] All 4 crash bugs are fixed and manually verified
- [ ] ESLint passes with zero errors
- [ ] Local Sonar (eslint-plugin-sonarjs) flags no new issues
- [ ] Commitlint + Husky enforce commit format and lint on every commit
- [ ] Server test coverage ≥ 70%, web ≥ 60%
- [ ] E2E tests cover the full booking flow in a real browser
- [ ] Memoria design system applied to all 5 pages
- [ ] Passwords hashed, JWT secret in `.env`, rate limiting on auth
- [ ] CI pipeline passes on every push to `main`
- [ ] App runs via `docker compose up`
