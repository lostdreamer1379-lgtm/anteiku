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
  const watchlistKey = ["watchlist"] as const;

  const query = useQuery<WatchlistEntry[]>({
    queryKey: watchlistKey,
    queryFn: fetchWatchlist,
    enabled: !!user,
    refetchOnMount: "always",
  });

  const add = useMutation({
    mutationFn: ({ animeId, status }: { animeId: number; status: WatchStatus }) =>
      addWatchlistEntry(animeId, status),
    onMutate: async ({ animeId, status }) => {
      await qc.cancelQueries({ queryKey: watchlistKey });
      const previous = qc.getQueryData<WatchlistEntry[]>(watchlistKey);
      const optimisticEntry: WatchlistEntry = {
        id: `optimistic-${animeId}`,
        animeId,
        status,
        updatedAt: new Date().toISOString(),
      };
      qc.setQueryData<WatchlistEntry[]>(watchlistKey, [
        ...(previous ?? []).filter((entry) => entry.animeId !== animeId),
        optimisticEntry,
      ]);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) qc.setQueryData(watchlistKey, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: watchlistKey }),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WatchStatus }) =>
      updateWatchlistEntry(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: watchlistKey });
      const previous = qc.getQueryData<WatchlistEntry[]>(watchlistKey);
      qc.setQueryData<WatchlistEntry[]>(
        watchlistKey,
        (previous ?? []).map((entry) =>
          entry.id === id ? { ...entry, status, updatedAt: new Date().toISOString() } : entry,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) qc.setQueryData(watchlistKey, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: watchlistKey }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteWatchlistEntry(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: watchlistKey });
      const previous = qc.getQueryData<WatchlistEntry[]>(watchlistKey);
      qc.setQueryData<WatchlistEntry[]>(watchlistKey, (previous ?? []).filter((entry) => entry.id !== id));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) qc.setQueryData(watchlistKey, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: watchlistKey }),
  });

  // Convenience: find current status for a given animeId
  function statusFor(animeId: number): WatchlistEntry | undefined {
    return query.data?.find((e) => e.animeId === animeId);
  }

  return { query, add, update, remove, statusFor };
}
