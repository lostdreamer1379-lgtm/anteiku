import { useQuery } from "@tanstack/react-query";
import { getSeasonalAnime, type SeasonalAnimeParams } from "@/services/anilist";

export function useSeasonalAnime(params: SeasonalAnimeParams) {
  return useQuery({
    queryKey: ["anime", "seasonal", params],
    queryFn: () => getSeasonalAnime(params),
    placeholderData: (prev) => prev,
  });
}
