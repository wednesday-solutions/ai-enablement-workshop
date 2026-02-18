# StagePass

A movie ticket booking web app — think BookMyShow. Browse movies, pick a showtime, select seats, and confirm a booking.

**This codebase is intentionally broken.** It ships with real bugs, security holes, and no tests — designed as a workshop demo for AI-assisted SDLC improvement.

---

## Quick Start

**Prerequisites:** Node.js ≥ 18, pnpm (`npm install -g pnpm`)

```bash
pnpm install
pnpm seed      # creates the SQLite DB with 25 movies, 880+ showtimes
pnpm dev       # web → http://localhost:3000 | api → http://localhost:3001
```

**Demo credentials**
```
john@example.com / password123   (has bookings)
raj@example.com  / password123   (no bookings — triggers a bug)
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (`better-sqlite3`) |
| Auth | JWT (`jsonwebtoken`) |
| Monorepo | pnpm workspaces |

---

## Known Bugs (reproduce before fixing)

| # | How to trigger | What breaks |
|---|---------------|-------------|
| 1 | Click **Untitled Project X** | White screen crash — `cast_members.split()` on null |
| 2 | Select a seat, click it again | Seat stays visually selected — direct state mutation |
| 3 | Log in as `raj@example.com` → My Bookings | Infinite spinner — `setLoading` never called for empty list |
| 4 | Type anything in the search box | UI freezes 2 seconds — blocking `while` loop on main thread |

---

## Docs

| File | What it covers |
|------|---------------|
| [`docs/CODE_BASE_GUIDE.md`](docs/CODE_BASE_GUIDE.md) | Full repo structure, API reference, DB schema, auth flow |
| [`docs/ISSUES_IN_THE_CODEBASE.md`](docs/ISSUES_IN_THE_CODEBASE.md) | Catalogue of 33 known issues across crashes, perf, security, quality |
| [`docs/PLAN_OF_ACTION.md`](docs/PLAN_OF_ACTION.md) | 5-phase improvement plan with commands and configs |
| [`docs/INCREMENTAL_CHANGE_PLAN.md`](docs/INCREMENTAL_CHANGE_PLAN.md) | Session map — one row per PR, branch names, files touched, handoff prompt |

---

## Repo Structure

```
packages/
├── common/    # Shared TypeScript types
├── server/    # Express + SQLite API (port 3001)
└── web/       # React + Vite frontend (port 3000)
docs/          # Workshop guides (start here)
```

---

## Scripts

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start server + web in parallel |
| `pnpm dev:server` | API only |
| `pnpm dev:web` | Frontend only |
| `pnpm seed` | Wipe DB and reseed |
| `pnpm build` | Build all packages |
