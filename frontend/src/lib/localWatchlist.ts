import type { WatchStatus } from "@/types/anime";

// Phase-1/3 stand-in only: persists watchlist status in localStorage so the
// Anime Details page's status buttons are real and functional before the
// Phase 4 backend-backed watchlist (Postgres via Prisma, per-user) exists.
// This is explicitly NOT the durable per-user store the brief specifies —
// it never reaches across devices or accounts, and is replaced wholesale
// once POST/PATCH /api/watchlist are implemented.

const KEY = "anteiku:local-watchlist";

type LocalWatchlist = Record<number, WatchStatus>;

function read(): LocalWatchlist {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LocalWatchlist) : {};
  } catch {
    return {};
  }
}

function write(data: LocalWatchlist) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private browsing, quota) — fail silently, status
    // buttons simply won't persist across reloads.
  }
}

export function getLocalStatus(animeId: number): WatchStatus | null {
  return read()[animeId] ?? null;
}

export function setLocalStatus(animeId: number, status: WatchStatus | null) {
  const data = read();
  if (status === null) delete data[animeId];
  else data[animeId] = status;
  write(data);
}
