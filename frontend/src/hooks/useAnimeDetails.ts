import { useQuery } from "@tanstack/react-query";
import { getAnimeDetails } from "@/services/anilist";

export function useAnimeDetails(id: number | undefined) {
  return useQuery({
    queryKey: ["anime", "details", id],
    queryFn: () => getAnimeDetails(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  });
}
