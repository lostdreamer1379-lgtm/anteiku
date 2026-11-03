import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchWatchlist,
  addWatchlistEntry,
  updateWatchlistEntry,
  deleteWatchlistEntry,
} from "@/services/api/watchlistApi";
import type { WatchStatus, WatchlistEntry } from "@/types/anime";

export function useWatchlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery<WatchlistEntry[]>({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist,
    enabled: !!user,
  });

  const add = useMutation({
    mutationFn: ({ animeId, status }: { animeId: number; status: WatchStatus }) =>
      addWatchlistEntry(animeId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WatchStatus }) =>
      updateWatchlistEntry(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteWatchlistEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  // Convenience: find current status for a given animeId
  function statusFor(animeId: number): WatchlistEntry | undefined {
    return query.data?.find((e) => e.animeId === animeId);
  }

  return { query, add, update, remove, statusFor };
}
