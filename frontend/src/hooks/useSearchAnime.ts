import { useQuery } from "@tanstack/react-query";
import { searchAnime, type SearchAnimeParams } from "@/services/anilist";

export function useSearchAnime(params: SearchAnimeParams) {
  return useQuery({
    queryKey: ["anime", "search", params],
    queryFn: () => searchAnime(params),
    placeholderData: (prev) => prev,
  });
}
