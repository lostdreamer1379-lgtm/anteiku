import { useQuery } from "@tanstack/react-query";
import { getTrendingAnime } from "@/services/anilist";

export function useTrendingAnime(perPage = 12) {
  return useQuery({
    queryKey: ["anime", "trending", perPage],
    queryFn: () => getTrendingAnime(perPage),
  });
}
