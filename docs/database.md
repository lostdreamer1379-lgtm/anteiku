# Database

PostgreSQL, hosted on Supabase, accessed through Prisma.

`Profile.id` is the Supabase Auth user UUID — there is no separate
application-level user table or password store. A `Profile` row is created
the first time a user interacts with something that needs one (e.g. first
watchlist add), keyed off the verified `req.userId`.

`WatchlistEntry` is unique on `(userId, animeId)` to prevent duplicate
entries for the same anime. `WatchProgress` is unique on
`(userId, animeId, episodeNumber)`.

Run migrations with:

```bash
cd backend
npx prisma migrate dev --name <description>
```
