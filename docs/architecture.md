# Anteiku — Architecture & Phase Plan

## Repository layout

```
anteiku/
  frontend/   React + Vite + TypeScript + Tailwind
  backend/    Express + TypeScript + Prisma
  docs/       This file, database.md, api.md
```

Frontend and backend are independent apps with their own package.json,
deployed separately (frontend → Vercel static, backend → Vercel Node
functions or equivalent Node host). Anteiku does not share a login,
database, or account system with any other product.

## Layering

- **Components** (`frontend/src/components`) are presentation-only.
- **Services** (`frontend/src/services`) own all external I/O: AniList
  GraphQL, the backend REST API, Supabase Auth. Components never construct
  GraphQL queries or fetch calls directly.
- **Backend controllers/services/routes** follow the same separation:
  routes wire HTTP → controllers, controllers call services, services talk
  to Prisma/AniList.

## Auth flow

1. Frontend signs the user in via Supabase Auth (`@supabase/supabase-js`),
   using only the public URL + publishable key.
2. Every authenticated API call attaches the Supabase access token as a
   Bearer header (`services/api/client.ts`).
3. The backend's `requireAuth` middleware verifies that token against
   Supabase and derives `req.userId` from the verified token — it never
   trusts a user id supplied in the request body or query string.

## Phase plan (status)

| Phase | Scope | Status |
|---|---|---|
| 1 — Foundation | repo scaffold, TS/Tailwind/Prisma config, health endpoint | **Done** |
| 2 — Design system | tokens, nav, buttons, cards, skeletons | **Done** (core set; expand as new UI needs arise) |
| 3 — Discovery | AniList-backed Home, Explore, Seasonal, AnimeDetails | **Done** — see below |
| 4 — User system | Auth UI, protected routes, profile, watchlist, progress | **Done** — see below |
| 5 — Playback | Provider-independent player, episode nav, progress sync | **Done** — see below |
| 6 — Quality & deployment | Tests, error boundary, deploy configs | **Done** — see below |

### Phase 4 detail (just completed)

**Backend (all routes live):**
- `GET/PUT /api/profile` — username + avatarUrl, auto-creates Profile on first call
- `GET/POST/PATCH/DELETE /api/watchlist` — full CRUD, upsert-safe, ownership
  validated server-side on every mutation; backend never trusts client-supplied user id
- `GET/POST/PATCH /api/progress` — episode progress upsert unique on
  `(userId, animeId, episodeNumber)`, ownership validated on PATCH
- Controllers → Services → Prisma pattern; Zod validation on all inputs;
  centralised error handler; no stack traces in production responses

**Frontend:**
- `AuthContext` — Supabase session hydrated from persisted storage on mount,
  live-updated via `onAuthStateChange`; `signOut()` exposed to all consumers
- `ProtectedRoute` — redirects unauthenticated users to `/signin` with
  return-location state; shows a loading dot while session resolves
- Sign In — React Hook Form + Zod, server error display, redirects to original
  destination after sign in
- Sign Up — email/password + confirm with client-side match validation;
  handles both immediate-session and email-confirmation flows
- Reset Password — sends Supabase magic link; shows a success state
- Profile page — reads `GET /api/profile`, updates via `PUT /api/profile`,
  username uniqueness enforced server-side, sign-out button
- Watchlist page — status tabs (All/Watching/Completed/…), count badges,
  inline status-change dropdown, per-row delete; empty states per tab
- `WatchStatusButtons` on AnimeDetails — now calls the real
  `POST/PATCH/DELETE /api/watchlist` endpoints when signed in, and
  gracefully falls back to a locked-down view with a sign-in prompt when
  signed out (the `localStorage` stand-in from Phase 3 is retired for
  signed-in users; `lib/localWatchlist.ts` is kept but only used as
  last-resort fallback)
- Navbar — auth-aware: initials avatar + dropdown (Profile, Sign out) when
  signed in; Sign in link when signed out; mobile menu updated to match

### Phase 3 detail (just completed)

- **Home** (`pages/Home`) — hero + three carousels (Trending, Currently
  Airing, This Season), all live AniList queries via `useHomeCarousels`.
- **Explore** (`pages/Explore`) — debounced title search, genre/format/sort
  filters, pagination — all synced to the URL query string so results are
  shareable/bookmarkable. Backed by `searchAnime` in `services/anilist`.
- **Seasonal** (`pages/Seasonal`) — season/year stepper (AniList's own
  WINTER/SPRING/SUMMER/FALL boundaries, `lib/season.ts`), live results, and
  a real next-airing-episode countdown per card where AniList reports one.
- **AnimeDetails** (`pages/AnimeDetails`) — full metadata (synopsis,
  studios, score, episodes, genres linking back into Explore), Related and
  Recommendations carousels, and working status buttons (Watching /
  Completed / Planning / Paused / Dropped).

None of this uses fabricated/mock anime data — every list and detail view
is a real AniList GraphQL response, mapped through `services/anilist/mappers.ts`.

**Explicit scope note:** the watchlist status buttons on AnimeDetails
persist to `localStorage` only (see `lib/localWatchlist.ts`'s own comment).
This is a deliberate, labeled stand-in so the buttons are genuinely
functional today, not a claim that per-user persistence (the brief's actual
requirement) is done — that still needs Phase 4's Postgres-backed
`/api/watchlist` routes and will replace this file's calls outright.

## Why some pages are placeholders

Per the project brief's own instruction not to implement the entire
platform in one uncontrolled pass, Phase 1 prioritizes a correct,
inspectable foundation over broad-but-shallow coverage. Each placeholder
page states which phase will replace it, and the service layer it will
call (`services/anilist`, `services/api`) already exists and is typed.

## Remaining setup requirements

- Configure Supabase project values in the frontend and backend environment
  files, then apply the Prisma migration to the Supabase PostgreSQL database.
- Configure Vercel environment variables before deployment.
- Playback-source availability and permissions are external dependencies. The
  app defaults to demo clips; select VidRift explicitly with
  `VITE_PLAYBACK_PROVIDER=vidrift` only for content you are authorised to embed.

### Phase 5 detail

**Playback abstraction (`components/player/providers/`):**
- `PlaybackProvider.ts` — chooses the configured provider.
- `DemoProvider.ts` — sample MP4s for local development and UI testing.
- `VidRiftProvider.ts` — builds the documented AniList iframe URL, including
  Anteiku branding, dub selection, exit handling, and Anteiku-owned episode nav.

**Player UI (`components/player/`):**
- `Player.tsx` — renders native `<video>` controls for demo clips or the
  cross-origin `VidRiftPlayer` iframe for VidRift.
- `VidRiftPlayer.tsx` — checks message origin and source, requests player state,
  restores saved progress with the documented resume message, and handles
  progress/pause/ended/exit notifications.
- `PlayerControls.tsx` — custom controls for direct demo video only; VidRift
  supplies its own cross-origin controls.

**Watch page (`pages/Watch/`):**
- Loads anime metadata from AniList and gets episode counts/title.
- Reads and writes the signed-in user's episode progress through the backend.
- Provides an episode grid and an English-dub toggle for VidRift playback.

### Phase 6 detail (just completed)

**Error handling:**
- `ErrorBoundary` class component wraps `<Outlet>` in `AppLayout`; catches render errors, shows on-brand fallback, logs in dev, recovers via refresh

**Tests:**
- Frontend: Vitest + React Testing Library; 4 test files covering Home, Explore, Auth (SignIn/SignUp) and Player; Supabase and AniList mocked so tests are fully offline
- Backend: Vitest + Supertest; covers `GET /api/health`, 404, auth middleware (401 on missing token), Zod validation (400 on bad body)
- E2e: Playwright config + `e2e/homepage.spec.ts` covering homepage render, nav links, URL-synced search, 404, auth page access and watchlist redirect — run against the live dev server

**Deploy:**
- `frontend/vercel.json` — Vite preset, SPA rewrite, immutable asset cache headers, security headers
- `backend/vercel.json` — `@vercel/node` build, `/api/*` route mapping
- `docs/deployment.md` — step-by-step guide: Supabase auth+DB setup, migration, frontend deploy, backend deploy, environment variables, local dev, running tests, connecting a licensed provider
