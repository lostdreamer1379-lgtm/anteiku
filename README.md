# ANTEIKU

A Japanese café-inspired anime discovery and streaming web application —
dark, cinematic, unhurried.

> **Status: Phases 1–6 complete.**
> Every phase is implemented: live AniList discovery (Home, Explore,
> Seasonal, Anime Details), full auth (Supabase sign-in/up/reset,
> protected routes), backend-persisted watchlist and progress (Postgres via
> Prisma), a provider-independent video player with episode navigation and
> progress sync, unit tests (Vitest + RTL), API tests (Supertest), e2e
> tests (Playwright), error boundary, and Vercel deploy configs.
> See `docs/architecture.md` and `docs/deployment.md`.

## Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Motion, Lucide, React Hook Form, Zod
- **Backend:** Node.js, Express, TypeScript, Zod, Helmet, CORS
- **Database:** PostgreSQL via Supabase + Prisma
- **Auth:** Supabase Auth
- **Metadata:** AniList GraphQL API

## Getting started

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL / SUPABASE_URL / SUPABASE_JWT_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

The frontend runs on `http://localhost:5173`, the backend on `http://localhost:4000`.

## What's real right now

- Home, Explore, Seasonal and Anime Details all fetch **live** data from
  the public AniList GraphQL API — no mock/fabricated anime.
- Explore has working debounced search, genre/format filters, sort, and
  URL-synced pagination.
- Seasonal has a season/year stepper and a live next-episode countdown.
- Anime Details shows full metadata plus Related/Recommendations and
  working watch-status buttons (persisted to `localStorage` for now —
  explicitly documented as a Phase 4 stand-in, see `docs/architecture.md`).
- `GET /api/health` is a real, working endpoint.
- Supabase auth middleware verifies real tokens (no auth routes/UI yet).
- Prisma schema models `Profile`, `WatchlistEntry`, `WatchProgress` against
  the Supabase Auth UUID — no migration has been run against a live database
  yet since none is connected in this environment.

## What's complete

| Phase | Scope |
|---|---|
| 1 Foundation | Repo scaffold, TypeScript, Tailwind, Prisma, Express, health endpoint |
| 2 Design system | Tokens, Navbar, Footer, Button, PosterCard, carousels, skeletons |
| 3 Discovery | Home (3 live carousels), Explore (search+filters+pagination), Seasonal (stepper+countdown), AnimeDetails (metadata+relations) |
| 4 User system | Sign in/up/reset, AuthContext, ProtectedRoute, Profile page, Watchlist page, backend API (profile/watchlist/progress), Zod validation, ownership checks |
| 5 Playback | Provider selector, native sample-video player, VidRift iframe player, resume/progress messages, dub toggle, episode navigation |
| 6 Quality & deploy | ErrorBoundary, Vitest+RTL frontend tests, Supertest backend tests, Playwright e2e, Vercel configs, deployment guide |

## Playback provider

The app defaults to sample-video playback. To select the VidRift iframe adapter,
set `VITE_PLAYBACK_PROVIDER=vidrift` in `frontend/.env` and restart Vite. The
current VidRift embed docs describe an AniList-ID URL and a no-key iframe; no
VidRift API key is required. Playback still depends on VidRift having a mapping
and an available source for the title. VidRift states that it relays publicly
reachable media rather than owning or storing it, so only embed content you are
authorised to display. See `docs/deployment.md` for details.

## Environment variables

Secrets are never committed. See `frontend/.env.example` and
`backend/.env.example` for the exact variables each service needs, and fill
them in locally — this scaffold does not assume any external service is
already configured.
