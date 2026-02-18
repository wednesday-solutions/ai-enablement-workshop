# Issues in the StagePass Codebase

A catalogue of everything wrong with this codebase — bugs, performance problems, security holes, code quality issues, and missing best practices. This document exists to guide an AI-assisted SDLC improvement session.

---

## 1. Crashes & Runtime Bugs

### 1.1 App crashes on `Untitled Project X` detail page
**File:** `packages/web/src/pages/MovieDetail.tsx`

`cast_members` and `synopsis` are `null` in the database for this movie. The code calls `.split()` on `cast_members` and `.length` on `synopsis` without any null checks, throwing a `TypeError` and crashing the entire page.

```ts
// Crashes: Cannot read properties of null (reading 'split')
movie!.cast_members.split(',').join(' | ')

// Crashes: Cannot read properties of null (reading 'length')
movie!.synopsis.length > 0 ? movie!.synopsis : 'No synopsis available'
```

### 1.2 Seat selection state mutation bug
**File:** `packages/web/src/pages/SeatSelection.tsx`

The `toggleSeat` function directly mutates the `selectedSeats` array using `splice` and `push` instead of creating a new array. React does not detect state changes when the reference stays the same, so seats do not visually toggle correctly when deselected.

```ts
// BUG: Mutates array directly — React won't re-render
selectedSeats.splice(index, 1);
setSelectedSeats(selectedSeats); // same reference, no re-render
```

### 1.3 Infinite loading spinner on empty bookings
**File:** `packages/web/src/pages/MyBookings.tsx`

`setLoading(false)` is only called inside an `if (data.length > 0)` block. A user with no bookings will see a spinning loader forever — the empty state is unreachable.

```ts
.then(data => {
  setBookings(data);
  if (data.length > 0) {  // BUG: loading never set to false for new users
    setLoading(false);
  }
});
```

### 1.4 No error handling on API fetches
**Files:** `MovieDetail.tsx`, `SeatSelection.tsx`, `Home.tsx`

Every `fetch()` call assumes success. Network failures, 404s, and 500s are silently ignored — the app either freezes on a loading state or crashes with an unhandled exception.

---

## 2. Performance Issues

### 2.1 Search blocks the main thread for 2 seconds
**File:** `packages/web/src/pages/Home.tsx`

The search filter contains an intentional `while` loop that spins for 2000ms on every keystroke, freezing the entire UI — no scrolling, no typing, nothing.

```ts
const start = Date.now();
while (Date.now() - start < 2000) {
  Math.random(); // blocks the main thread
}
```

### 2.2 No pagination or virtualisation on movie list
**File:** `packages/web/src/pages/Home.tsx`

All movies are fetched and rendered in a single DOM dump. At scale this causes layout thrashing and slow initial render.

### 2.3 No `useCallback` or `useMemo` anywhere
Every render recreates all functions and computed values from scratch. Combined with the flat component structure, this causes unnecessary re-renders throughout.

---

## 3. Security Issues

### 3.1 Passwords stored in plain text
**File:** `packages/server/src/routes/auth.ts`, `packages/server/src/seed.ts`

Passwords are inserted and queried as plain strings. There is no hashing (bcrypt, argon2, etc.).

```ts
// Stores raw password in DB
INSERT INTO users (name, email, password) VALUES (?, ?, ?)

// Queries by plain text password
SELECT * FROM users WHERE email = ? AND password = ?
```

### 3.2 Hardcoded JWT secret
**File:** `packages/server/src/routes/auth.ts`

The JWT signing secret is hardcoded as a string literal in source code.

```ts
const JWT_SECRET = 'stagepass-secret-key-not-secure';
```

### 3.3 No input validation or sanitisation
**File:** `packages/server/src/routes/` (all route files)

Request bodies are used directly without validation. No schema validation library (zod, joi, etc.) is used anywhere. A malformed request body can cause unexpected DB behaviour or crashes.

### 3.4 SQL injection surface
**File:** `packages/server/src/routes/movies.ts`

Genre and search filters are concatenated into the query string rather than always using parameterised placeholders consistently. While `better-sqlite3` uses prepared statements, the conditional query construction is fragile.

### 3.5 No rate limiting
The auth endpoints (`/api/auth/login`, `/api/auth/signup`) have no rate limiting, making brute-force attacks trivial.

### 3.6 Token not persisted across page refresh
**File:** `packages/web/src/AuthContext.tsx`

The JWT token and user are stored only in React state — a page refresh logs the user out completely. `localStorage` or `sessionStorage` is never used.

---

## 4. Code Quality Issues

### 4.1 No TypeScript strictness on server
**File:** `packages/server/src/routes/`

Routes use `any` types extensively (`req: any`, `params: any[]`). The value of TypeScript is largely lost.

### 4.2 Magic strings and numbers everywhere
Seat row letters, price ranges, venue names, and date ranges are all hardcoded inline in `seed.ts` and route files with no constants or configuration.

### 4.3 No error boundaries in React
**File:** `packages/web/src/App.tsx`

There are no React Error Boundaries. A single component crash (like the `cast_members` null crash) takes down the entire application with a blank white screen and no user-facing message.

### 4.4 Inconsistent styling approach
**File:** `packages/web/src/`

The codebase mixes Tailwind utility classes, inline `style={{}}` objects, and a global CSS file (`index.css`) with hand-written class names. There is no consistent design system applied — every page looks different.

### 4.5 `App.tsx` renders `<Header>` inside `<AuthProvider>` incorrectly
**File:** `packages/web/src/App.tsx`

`Header` is defined as a standalone component inside `App.tsx` and rendered as a sibling to the router, but it sits inside the `AuthProvider`. This is fine for now but couples concerns unnecessarily and will break if the component is ever extracted.

### 4.6 No environment variables
Database path, JWT secret, port number, and API base URL are all hardcoded. There is no `.env` support and no `dotenv` or equivalent.

### 4.7 Seed script does not guard against re-runs in production
`seed.ts` deletes all data at the top unconditionally. Running it accidentally against a real database would wipe everything.

---

## 5. Missing Features & UX Problems

### 5.1 No empty state on movie detail showtimes
If a movie has no showtimes for the selected date, nothing renders — no message, no alternative.

### 5.2 No seat count shown on showtime cards
The user has no idea how many seats are left when choosing a showtime.

### 5.3 Booking confirmation page shows no booking details
The confirmation page only shows the booking ID number. It does not show the movie name, venue, date, time, seats, or amount paid.

### 5.4 No form validation on login/signup
Fields can be submitted empty. Email format is not validated client-side. Password length has no minimum.

### 5.5 No loading state on booking submission
The "Confirm Booking" button sets `booking = true` but the UI feedback is minimal — there's no visible progress indicator while the API call is in flight.

### 5.6 No way to cancel a booking
My Bookings page is read-only. There is no cancellation flow.

---

## 6. Testing

### 6.1 Zero tests
There are no unit tests, integration tests, or end-to-end tests anywhere in the project. No test runner is configured (`vitest`, `jest`, `playwright`, etc.).

### 6.2 No test utilities or factories
No seed factories, mock helpers, or API interceptors exist to support future testing.

---

## 7. Tooling & DevOps

### 7.1 No linting configured
There is no ESLint config anywhere. Code style is inconsistent and no static analysis runs on CI or pre-commit.

### 7.2 No Prettier config
Code formatting is inconsistent — mixed quote styles, inconsistent spacing, trailing commas missing.

### 7.3 No CI pipeline
There is no GitHub Actions, GitLab CI, or any other pipeline. Nothing runs on push.

### 7.4 No Sonar or code quality gate
No static analysis tool (SonarCloud, SonarQube, `eslint-plugin-sonarjs`) is configured.

### 7.5 `node_modules` not in `.gitignore` properly
The `.gitignore` exists but `.DS_Store` files are present in the working tree, suggesting it was added after the fact.

---

## Summary Table

| Category | Count |
|---|---|
| Crashes / Runtime Bugs | 4 |
| Performance | 3 |
| Security | 6 |
| Code Quality | 7 |
| Missing UX / Features | 6 |
| Testing | 2 |
| Tooling & DevOps | 5 |
| **Total** | **33** |
