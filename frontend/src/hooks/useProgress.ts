import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProgress, upsertProgress, patchProgress } from "@/services/api/progressApi";
import type { WatchProgressEntry } from "@/types/anime";

export function useProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery<WatchProgressEntry[]>({
    queryKey: ["progress"],
    queryFn: fetchProgress,
    enabled: !!user,
    refetchOnMount: "always",
    refetchInterval: user ? 15_000 : false,
  });

  const upsert = useMutation({
    mutationFn: ({
      animeId,
      episodeNumber,
      progressSeconds,
      completed,
    }: {
      animeId: number;
      episodeNumber: number;
      progressSeconds: number;
      completed: boolean;
    }) => upsertProgress(animeId, episodeNumber, progressSeconds, completed),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress"] }),
  });

  const patch = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: { progressSeconds?: number; completed?: boolean } }) =>
      patchProgress(id, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress"] }),
  });

  function progressFor(animeId: number, episodeNumber: number): WatchProgressEntry | undefined {
    return query.data?.find(
      (p) => p.animeId === animeId && p.episodeNumber === episodeNumber
    );
  }

  return { query, upsert, patch, progressFor };
}
