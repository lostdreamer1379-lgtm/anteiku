import type { WatchProgressEntry } from "@/types/anime";

function storageKey(userId?: string) {
  return `anteiku:progress:${userId ?? "guest"}`;
}

function read(userId?: string): WatchProgressEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as WatchProgressEntry[]) : [];
  } catch {
    return [];
  }
}

function write(userId: string | undefined, entries: WatchProgressEntry[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(entries));
  } catch {
    // Storage can be unavailable in private browsing; playback still works.
  }
}

export function getLocalProgress(userId?: string) {
  return read(userId);
}

export function saveLocalProgress(
  userId: string | undefined,
  input: { animeId: number; episodeNumber: number; progressSeconds: number; completed: boolean },
) {
  const entries = read(userId);
  const now = new Date().toISOString();
  const index = entries.findIndex(
    (entry) => entry.animeId === input.animeId && entry.episodeNumber === input.episodeNumber,
  );
  const next: WatchProgressEntry = {
    id: `local-${input.animeId}-${input.episodeNumber}`,
    ...input,
    updatedAt: now,
  };
  if (index === -1) entries.push(next);
  else entries[index] = next;
  write(userId, entries);
  return next;
}

export function patchLocalProgress(
  userId: string | undefined,
  id: string,
  fields: { progressSeconds?: number; completed?: boolean },
) {
  const entries = read(userId);
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) throw new Error("Progress record not found");
  entries[index] = { ...entries[index], ...fields, updatedAt: new Date().toISOString() };
  write(userId, entries);
  return entries[index];
}
