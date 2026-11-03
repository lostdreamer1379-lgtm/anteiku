import { useTrendingAnime } from "./useTrendingAnime";
import { useSearchAnime } from "./useSearchAnime";
import { useSeasonalAnime } from "./useSeasonalAnime";
import { getCurrentSeason } from "@/lib/season";

export function useHomeCarousels() {
  const trending = useTrendingAnime(12);

  const airing = useSearchAnime({
    status: "RELEASING",
    sort: ["POPULARITY_DESC"],
    perPage: 12,
  });

  const { season, year } = getCurrentSeason();
  const seasonal = useSeasonalAnime({ 
    season, 
    seasonYear: year, 
    perPage: 12 });

  return { trending, airing, seasonal, currentSeasonLabel: `${season} ${year}` };
}
