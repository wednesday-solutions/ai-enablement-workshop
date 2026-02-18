# Incremental Change Plan — StagePass

A guide to improving the StagePass codebase with AI assistance, phase by phase.

**Estimated total time with AI: ~6 hours**
**Without AI: 2–3 days**

---

## Ground Rules

These rules apply to every single change made in this codebase, no exceptions.

### Branching
Every change — no matter how small — lives on its own branch. Never commit directly to `main`. Branch names should reflect the type and scope of the change:

```
fix/       — bug fixes
perf/      — performance improvements
feat/      — new features
refactor/  — code quality, no behaviour changes
test/      — adding or updating tests
chore/     — tooling, config, infrastructure
ci/        — CI/CD pipeline changes
```

### Commits
Each commit should do exactly one thing. If you find yourself writing "and" in a commit message, that's two commits. Ask yourself before committing: *if I needed to revert just this change, could I?*

Commit message format (enforced by commitlint — set up in Phase 1):
```
<type>(<scope>): <short summary>

<optional body — what and why, not how>
```

Examples of good atomic commits:
```
fix(MovieDetail): null-check cast_members before calling .split()
fix(auth): move JWT_SECRET from hardcoded string to process.env
perf(Home): remove blocking while loop from search filter
refactor(server): replace req: any with typed Express interfaces
```

### Pull Requests
Every branch gets a PR before it touches `main`. PRs should be small and focused — a reviewer should be able to understand the entire change in under 5 minutes.

Before raising a PR, verify:
- [ ] The branch does exactly one thing and nothing more
- [ ] No unrelated changes are bundled in
- [ ] Commit messages are clean and follow the format above
- [ ] No `console.log`, commented-out code, or `TODO` left behind
- [ ] Existing tests still pass

Use AI to review your own PR before asking a human — prompt it with the diff and ask for a code review focused on correctness, security, and code quality.

---

## Session Map — One Row = One Claude Code Session = One PR

Each session is self-contained. Start a new Claude Code session, tell it to work on the phase below, and it will create the branch, make the commits, and open a PR. Phases must be done in order within each group — fixes before tests, tests before CI.

| Phase | Branch to create | Files touched | PR title |
|-------|-----------------|---------------|----------|
| **1** | `chore/tooling-baseline` | `eslint.config.js`, `.prettierrc`, `commitlint.config.js`, `.husky/`, root `package.json` | `chore: add ESLint, SonarJS, Prettier, Commitlint, Husky` |
| **2a** | `fix/null-crashes` | `MovieDetail.tsx`, `MyBookings.tsx`, `SeatSelection.tsx` | `fix: null-check cast/synopsis, fix loading state, fix seat state mutation` |
| **2b** | `feat/error-boundary` | `src/ErrorBoundary.tsx` (new), `App.tsx` | `feat: add ErrorBoundary around route tree` |
| **2c** | `perf/remove-blocking-search` | `Home.tsx` | `perf: remove blocking while loop, add useMemo and useCallback` |
| **2d** | `fix/auth-security` | `server/src/routes/auth.ts`, `server/src/seed.ts`, `.env.example`, `AuthContext.tsx` | `fix: hash passwords, move JWT secret to env, add rate limiting, persist token` |
| **2e** | `feat/memoria-design-system` | All `pages/*.tsx`, `App.tsx`, `index.css` | `feat: apply Memoria dark design system across all pages` |
| **2f** | `refactor/code-quality` | `server/src/routes/*.ts`, `server/src/constants.ts` (new), `server/src/seed.ts` | `refactor: typed routes, extract magic strings, add seed guard` |
| **3a** | `test/unit` | `**/*.test.tsx`, `**/*.test.ts` | `test: add unit tests for all components and server handlers` |
| **3b** | `test/integration` | `server/src/**/*.integration.test.ts` | `test: add integration tests — full booking flow against in-memory DB` |
| **3c** | `test/e2e` | `e2e/**/*.spec.ts` (new), `playwright.config.ts` (new) | `test: add Playwright E2E tests for full user journeys` |
| **4** | `ci/github-actions` | `.github/workflows/ci.yml` (new) | `ci: add GitHub Actions pipeline — lint, test, coverage, Sonar` |
| **5** | `chore/docker` | `packages/server/Dockerfile`, `packages/web/Dockerfile`, `docker-compose.yml` | `chore: add Dockerfiles and docker-compose for server and web` |

### How to hand off to a new session

Start a new Claude Code session in this repo and say:

> "Read `docs/INCREMENTAL_CHANGE_PLAN.md` and `docs/ISSUES_IN_THE_CODEBASE.md`, then work on phase **[X]**. Create the branch listed in the session map, make atomic commits following the ground rules, then open a PR."

The session will have everything it needs from those two docs.

---

## Time Estimate Breakdown

| Phase | What | Est. Time (with AI) |
|-------|------|---------------------|
| 1 | Tooling — ESLint, SonarJS, Prettier, Commitlint, Husky | 30 min |
| 2a | Fix null crashes and state mutation bugs | 20 min |
| 2b | Add ErrorBoundary | 15 min |
| 2c | Fix performance — blocking search | 15 min |
| 2d | Fix security — auth hardening | 45 min |
| 2e | Apply Memoria design system | 2 hrs |
| 2f | Code quality cleanup | 30 min |
| 3a | Unit tests | 45 min |
| 3b | Integration tests | 30 min |
| 3c | E2E tests | 30 min |
| 4 | CI pipeline | 20 min |
| 5 | Docker + deployment | 20 min |
| **Total** | | **~6 hrs** |

---

## Phase 1 — Tooling Baseline

Establish a quality baseline before touching any product code. Nothing ships without this in place.

### What to set up
- **ESLint** with TypeScript support (`@eslint/js`, `typescript-eslint`)
- **eslint-plugin-sonarjs** — catches cognitive complexity violations, duplicated code blocks, and code smells without needing a Sonar server
- **Prettier** — consistent formatting across the codebase
- **Commitlint** — enforces the commit message format on every `git commit`
- **Husky** — runs lint, format check, and commitlint as pre-commit and commit-msg git hooks
- Lint and format scripts in root `package.json`

### Running Sonar locally

**Option A — eslint-plugin-sonarjs (zero setup, recommended)**
```bash
pnpm lint
# Surfaces cognitive complexity, no-identical-expressions,
# no-ignored-return, duplicated blocks — same rules as SonarQube
```

**Option B — Full SonarQube via Docker (gives the visual dashboard)**
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
# Wait ~60s, then scan:
npx sonar-scanner \
  -Dsonar.projectKey=stagepass \
  -Dsonar.sources=packages/web/src,packages/server/src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=admin \
  -Dsonar.password=admin
# View results at http://localhost:9000
```

Run the linter immediately after setup and save the output to `docs/lint-baseline.txt`. This is your before state — you'll compare it against the output after fixes.

### Commitlint + Husky

Set up commit message linting and pre-commit hooks so the quality guardrails are automatic — no relying on developers to remember.

**Install:**
```bash
pnpm add -Dw @commitlint/cli @commitlint/config-conventional husky
pnpm exec husky init
```

**`commitlint.config.js` at root:**
```js
export default { extends: ['@commitlint/config-conventional'] }
```

**`.husky/pre-commit`** — runs on every `git commit`:
```sh
pnpm lint
pnpm format --check
```

**`.husky/commit-msg`** — validates the commit message format:
```sh
pnpm exec commitlint --edit $1
```

With this in place, a commit with a message like `"fixed stuff"` will be rejected automatically. The only way to commit is with a properly formatted message like `fix(auth): move JWT_SECRET to .env`. This makes the commit discipline from the Ground Rules above enforceable rather than voluntary.

### Tests
None. This phase is tooling only.

---

## Phase 2 — Fixes

Work through issues in priority order. See `docs/ISSUES_IN_THE_CODEBASE.md` for full details on each issue.

### 2a — Null Crashes & State Bugs (Priority: Critical)

These are the visible crashes. Fix them first.

| Issue | File | What to fix |
|-------|------|-------------|
| `cast_members.split()` on null | `MovieDetail.tsx` | Optional chain + fallback string |
| `synopsis.length` on null | `MovieDetail.tsx` | Optional chain + fallback string |
| `setLoading(false)` inside `if (data.length > 0)` | `MyBookings.tsx` | Move outside the guard |
| `selectedSeats.splice()` mutates state directly | `SeatSelection.tsx` | Replace with `filter()` and spread |

Each fix is a separate commit on a dedicated branch.

### 2b — Error Boundary (Priority: High)

Add a React `ErrorBoundary` wrapping the route tree so any future unhandled render error shows a friendly fallback instead of a blank white screen. This is one focused PR: the component itself, then wiring it into `App.tsx`.

### 2c — Performance (Priority: High)

The blocking `while (Date.now() - start < 2000)` loop in `Home.tsx` freezes the entire browser tab on every keystroke. Remove it. Then add `useMemo` on the filtered movies computation and `useCallback` on event handlers to prevent unnecessary re-renders.

### 2d — Security (Priority: High)

Work through these one at a time — each is its own commit:

1. Add `dotenv` support and `.env.example` — all secrets out of source code
2. Move `JWT_SECRET` to `process.env`
3. Hash passwords with `bcrypt` on signup, use `bcrypt.compare` on login
4. Add `express-rate-limit` on `/api/auth/*`
5. Add `zod` validation on all request bodies
6. Persist auth token to `localStorage`, rehydrate on mount

### 2e — Memoria Design System (Priority: Medium)

Apply the [Memoria design system](https://gist.github.com/alichherawalla/8234538a50f9d089e0159c3e3634e17c) across the frontend. The core principles: dark monochromatic palette (`bg-neutral-950` base), numbers as heroes (`font-light text-white`), staggered animations via `framer-motion`, no accent colours, no inline styles.

Tackle one page per commit:
1. Global theme + remove legacy CSS
2. Header (extract to its own component)
3. Home page — dark card grid, staggered entry, hero rating
4. Movie Detail — blur-in transition, dark showtime pills
5. Seat Selection — dark grid, white selected state
6. My Bookings — hero amount, dark cards
7. Booking Confirmation — spring modal entry animation

### 2f — Code Quality (Priority: Low)

These are refactors with no behaviour change. Each is its own commit:
- Replace `req: any` and `params: any[]` with proper TypeScript types throughout server routes
- Extract magic strings (venue names, seat rows, prices) to a `constants.ts` file
- Add a production environment guard to `seed.ts` so it can't be run against a live database

---

## Phase 3 — Tests

Add tests after fixes are merged so tests reflect correct behaviour, not bugs. Each test type is its own branch and PR.

### 3a — Unit Tests

Test a single component or function in isolation. All external dependencies (API calls, DB) are mocked.

**What to cover:**

| File | Key assertions |
|------|---------------|
| `Home.tsx` | Filter by genre, search, combined filter, no blocking |
| `MovieDetail.tsx` | Renders gracefully with null cast/synopsis fields |
| `SeatSelection.tsx` | Toggle adds/removes seat without mutating state |
| `MyBookings.tsx` | Shows empty state (not spinner) for empty response |
| `Login.tsx` | Form validation, error display on failed login |
| `AuthContext.tsx` | Login/logout/rehydration with localStorage |
| `server/auth.ts` | Login/signup happy + error paths, rate limit |
| `server/movies.ts` | Genre filter, search filter, 404 on unknown ID |
| `server/bookings.ts` | Auth guard, seat booking, amount calculation |

**Tools:** Vitest + React Testing Library (web), Vitest + Supertest (server)

### 3b — Integration Tests

Test multiple real layers together — Express router + real SQLite (in-memory). No mocks.

**What to cover:**
- Full booking flow: signup → login → get movies → select showtime → book seats → verify in DB
- Auth flow: password is hashed in DB, JWT is valid, protected routes accept/reject tokens correctly

**Tools:** Vitest + Supertest against an in-memory test DB (not `stagepass.db`)

### 3c — E2E Tests

Run real user journeys in a real browser against the full running stack.

**What to cover:**
- Browse movies, filter by genre, search
- View movie detail, select showtime, select seats, confirm booking
- Booking appears in My Bookings
- Signup and login flows
- Unauthenticated access redirects to login
- Session persists after page refresh
- "Untitled Project X" shows graceful error (not blank screen)
- New user My Bookings shows empty state (not infinite spinner)

**Tools:** Playwright

### Coverage Targets

| Package | Lines | Branches |
|---------|-------|----------|
| `server` | ≥ 70% | ≥ 60% |
| `web` | ≥ 60% | ≥ 50% |

---

## Phase 4 — CI Pipeline

Once tests are in place, automate everything on push and PR. The pipeline should:

1. Install dependencies
2. Run lint
3. Run unit + integration tests with coverage
4. Run Sonar scan (upload coverage report)
5. Run E2E tests against the full stack

No PR should merge to `main` if the pipeline is red.

**Tools:** GitHub Actions

---

## Phase 5 — Docker + Deployment

Containerise both the server and web app for consistent, reproducible deployments.

- `packages/server/Dockerfile` — multi-stage, runs as non-root, exposes 3001
- `packages/web/Dockerfile` — Vite build stage + nginx:alpine serve stage
- `docker-compose.yml` at root — wires server + web with a named volume for the SQLite DB

Once Docker is working, add a deploy job to the CI pipeline that builds and pushes images on merge to `main`.

---

## Test Type Summary

| Type | Tool | Scope | Approx. count |
|------|------|-------|---------------|
| Unit | Vitest + RTL | Single component / handler, deps mocked | ~25 |
| Integration | Vitest + Supertest | API + real in-memory DB, no mocks | ~10 |
| E2E | Playwright | Full browser, full stack, real user flows | ~15 |
| Snapshot | Vitest + RTL | Design system class regressions | ~5 |
| **Total** | | | **~55** |
