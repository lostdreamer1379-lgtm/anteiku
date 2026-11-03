import { apiFetch } from "./client";
import type { WatchStatus, WatchlistEntry } from "@/types/anime";

interface ApiResponse<T> {
  data: T;
}

export function fetchWatchlist(): Promise<WatchlistEntry[]> {
  return apiFetch<ApiResponse<WatchlistEntry[]>>("/watchlist").then((r) => r.data);
}

export function addWatchlistEntry(animeId: number, status: WatchStatus): Promise<WatchlistEntry> {
  return apiFetch<ApiResponse<WatchlistEntry>>("/watchlist", {
    method: "POST",
    body: JSON.stringify({ animeId, status }),
  }).then((r) => r.data);
}

export function updateWatchlistEntry(id: string, status: WatchStatus): Promise<WatchlistEntry> {
  return apiFetch<ApiResponse<WatchlistEntry>>(`/watchlist/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }).then((r) => r.data);
}

export function deleteWatchlistEntry(id: string): Promise<void> {
  return apiFetch<void>(`/watchlist/${id}`, { method: "DELETE" });
}
