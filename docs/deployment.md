# Deployment Guide

## Prerequisites

- Supabase project created (free tier is sufficient)
- Vercel account
- Node.js ≥ 20

---

## 1. Supabase setup

### Auth

1. In the Supabase dashboard, go to **Authentication → Providers** and enable Email.
2. Optionally disable "Confirm email" during development for faster iteration.
3. In **Authentication → URL Configuration**, set:
   - Site URL: `https://your-frontend.vercel.app`
   - Redirect URLs: `https://your-frontend.vercel.app/reset-password`

### Database

1. Copy your **Supabase project URL** and **service-role key** (for backend) and **anon/public key** (for frontend).
2. From the Supabase dashboard → **Settings → Database**, copy the connection strings:
   - **Connection pooling (Transaction mode)** → `DATABASE_URL` (for Prisma in serverless)
   - **Direct connection** → `DIRECT_URL` (for Prisma migrations)

### Run migrations

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL and DIRECT_URL
npm run prisma:generate
npm run prisma:migrate -- --name init
```

---

## 2. Frontend deployment (Vercel)

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_API_BASE_URL
```

In Vercel:
1. Import the `anteiku/frontend` folder as a new project.
2. Framework preset: **Vite**.
3. Set environment variables:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase anon/public key
   - `VITE_API_BASE_URL` — your deployed backend URL + `/api` (e.g. `https://anteiku-backend.vercel.app/api`)
4. Deploy. `vercel.json` handles SPA rewrites and cache headers automatically.

---

## 3. Backend deployment (Vercel Node Functions)

```bash
cd backend
cp .env.example .env
# Fill in all variables
```

In Vercel:
1. Import the `anteiku/backend` folder as a new project.
2. Set environment variables:
   - `DATABASE_URL` — pooled Supabase connection string
   - `DIRECT_URL` — direct Supabase connection string
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_JWT_SECRET` — **service-role key** (not the anon key) — used server-side only, never exposed to the browser
   - `FRONTEND_ORIGIN` — your frontend Vercel URL (e.g. `https://anteiku.vercel.app`)
   - `NODE_ENV` — `production`
3. Deploy. `vercel.json` maps `/api/*` to the Express handler.

> **Security note:** `SUPABASE_JWT_SECRET` (service-role key) must never appear in frontend environment variables or client-side code. It is used exclusively by the backend to verify tokens.

---

## 4. Local development

```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000  
Health check: http://localhost:4000/api/health

---

## 5. Running tests

```bash
# Frontend unit tests (Vitest + RTL)
cd frontend && npm test

# Backend API tests (Vitest + Supertest)
cd backend && npm test

# E2e tests (Playwright) — requires dev server running
cd frontend && npx playwright test
```

---

## 6. Selecting VidRift playback (iframe player)

The app includes a VidRift iframe adapter. The active provider is selected with
`VITE_PLAYBACK_PROVIDER` in `frontend/.env`:

```env
VITE_PLAYBACK_PROVIDER=vidrift
```

Restart the Vite development server after changing this value. For the sample
MP4 player, use `VITE_PLAYBACK_PROVIDER=demo`.

VidRift's current documentation describes this embed route:

```text
https://embed.vidrift.net/embed/anilist/{anilist_id}/{episode}
```

It currently documents a public embed with no API key, account, or domain
allowlist. The player receives episode progress, pause, ended, and exit events
through `window.postMessage`. Anteiku validates both the message origin and the
iframe window, throttles progress writes, and uses the documented
`vidrift:resume` message to restore a saved position. The VidRift player itself
provides server, audio, subtitle, quality, and fullscreen controls. Anteiku
continues to own its episode grid and next/previous episode navigation.

The VidRift catalog may not map every AniList ID to a playable title; its docs
specifically note that an unmapped AniList ID can return a not-found screen. A
provider embed loading successfully does not guarantee that an episode source
is available.

**Content rights:** VidRift says it indexes and relays media that is already
publicly reachable and does not own or store that media. The integration code
does not establish a licence or grant streaming rights. Before enabling this
provider for any title, confirm you are authorised to embed/display that
content. For content without permission, use a licensed provider or the local
demo player instead.

Do not add a `sandbox` attribute to the iframe; VidRift's documentation says a
sandboxed iframe cannot play. Keep `referrerPolicy` at the default or
`strict-origin-when-cross-origin`.
