import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProgress, upsertProgress, patchProgress } from "@/services/api/progressApi";
import type { WatchProgressEntry } from "@/types/anime";
import { getLocalProgress, patchLocalProgress, saveLocalProgress } from "@/lib/localProgress";

export function useProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery<WatchProgressEntry[]>({
    queryKey: ["progress", user?.id ?? "guest"],
    queryFn: async () => {
      if (!user) return getLocalProgress();
      try {
        return await fetchProgress();
      } catch {
        return getLocalProgress(user.id);
      }
    },
    enabled: true,
    refetchOnMount: "always",
    refetchInterval: user ? 15_000 : false,
  });

  const upsert = useMutation({
    mutationFn: async ({
      animeId,
      episodeNumber,
      progressSeconds,
      completed,
    }: {
      animeId: number;
      episodeNumber: number;
      progressSeconds: number;
      completed: boolean;
    }) => {
      const local = saveLocalProgress(user?.id, { animeId, episodeNumber, progressSeconds, completed });
      if (!user) return local;
      return upsertProgress(animeId, episodeNumber, progressSeconds, completed).catch(() => local);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress", user?.id ?? "guest"] }),
  });

  const patch = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: { progressSeconds?: number; completed?: boolean } }) => {
      if (id.startsWith("local-")) return Promise.resolve(patchLocalProgress(user?.id, id, fields));
      return patchProgress(id, fields);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress", user?.id ?? "guest"] }),
  });

  function progressFor(animeId: number, episodeNumber: number): WatchProgressEntry | undefined {
    return query.data?.find(
      (p) => p.animeId === animeId && p.episodeNumber === episodeNumber
    );
  }

  return { query, upsert, patch, progressFor };
}
