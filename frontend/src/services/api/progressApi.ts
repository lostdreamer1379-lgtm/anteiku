import { apiFetch } from "./client";
import type { WatchProgressEntry } from "@/types/anime";

interface ApiResponse<T> {
  data: T;
}

export function fetchProgress(): Promise<WatchProgressEntry[]> {
  return apiFetch<ApiResponse<WatchProgressEntry[]>>("/progress").then((r) => r.data);
}

export function upsertProgress(
  animeId: number,
  episodeNumber: number,
  progressSeconds: number,
  completed: boolean
): Promise<WatchProgressEntry> {
  return apiFetch<ApiResponse<WatchProgressEntry>>("/progress", {
    method: "POST",
    body: JSON.stringify({ animeId, episodeNumber, progressSeconds, completed }),
  }).then((r) => r.data);
}

export function patchProgress(
  id: string,
  fields: { progressSeconds?: number; completed?: boolean }
): Promise<WatchProgressEntry> {
  return apiFetch<ApiResponse<WatchProgressEntry>>(`/progress/${id}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  }).then((r) => r.data);
}
