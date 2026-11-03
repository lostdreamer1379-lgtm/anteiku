# Backend API

Base path: `/api`

All authenticated routes require `Authorization: Bearer <supabase_access_token>`.
The backend verifies the token against Supabase and derives `req.userId` from
the verified claim — the client never supplies a user id directly.

## Health

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /health | no | ✅ implemented |

## Profile

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /profile | yes | ✅ implemented |
| PUT | /profile | yes | ✅ implemented |

PUT accepts `{ username?: string, avatarUrl?: string | null }`.
Username must be 3–32 chars, letters/numbers/`_`/`-` only.
On first access, a `Profile` row is created automatically from the Supabase Auth UUID.

## Watchlist

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /watchlist | yes | ✅ implemented |
| POST | /watchlist | yes | ✅ implemented |
| PATCH | /watchlist/:id | yes | ✅ implemented |
| DELETE | /watchlist/:id | yes | ✅ implemented |

POST accepts `{ animeId: number, status: WatchStatus }`.
Upserting (same animeId, different status) is idempotent.
Ownership is verified server-side on PATCH and DELETE.

## Progress

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | /progress | yes | ✅ implemented |
| POST | /progress | yes | ✅ implemented |
| PATCH | /progress/:id | yes | ✅ implemented |

POST accepts `{ animeId, episodeNumber, progressSeconds, completed }`.
Unique on `(userId, animeId, episodeNumber)` — repeated POSTs upsert.
Ownership is verified server-side on PATCH.

## Anime metadata proxy (planned — Phase 5 if caching is needed)

AniList is currently called directly from the frontend. A backend proxy
with Redis/in-memory caching could be added if rate-limit headroom becomes
a concern. Routes are stubbed in the architecture doc.
