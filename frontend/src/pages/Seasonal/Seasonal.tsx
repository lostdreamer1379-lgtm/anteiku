import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSeasonalAnime } from "@/hooks/useSeasonalAnime";
import {
  getCurrentSeason,
  shiftSeason,
  SEASON_LABELS,
  formatTimeUntilAiring,
  type Season,
} from "@/lib/season";
import PosterCard from "@/components/anime/PosterCard";
import PosterCardSkeleton from "@/components/ui/PosterCardSkeleton";

export default function Seasonal() {
  const current = getCurrentSeason();
  const [season, setSeason] = useState<Season>(current.season);
  const [year, setYear] = useState<number>(current.year);

  const { data, isLoading, isError } = useSeasonalAnime({ 
    season, 
    seasonYear: year, 
    perPage: 30 });

  function go(delta: 1 | -1) {
    const next = shiftSeason(season, year, delta);
    setSeason(next.season);
    setYear(next.year);
  }

  const isCurrent = season === current.season && year === current.year;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <h1 className="font-serif text-3xl text-ivory">Seasonal</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Browse anime by broadcast season — step backward for past seasons, forward for what's announced.
      </p>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous season"
          onClick={() => go(-1)}
          className="rounded-anteiku border border-border-subtle p-2 text-ivory hover:border-sage"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="font-serif text-xl text-ivory">
            {SEASON_LABELS[season]} {year}
          </p>
          {isCurrent && <p className="text-xs uppercase tracking-[0.2em] text-sage">Current season</p>}
        </div>

        <button
          type="button"
          aria-label="Next season"
          onClick={() => go(1)}
          className="rounded-anteiku border border-border-subtle p-2 text-ivory hover:border-sage"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-8">
        {isError && (
          <p className="rounded-anteiku border border-border-subtle bg-bg-card p-4 text-center text-sm text-muted">
            Couldn't load this season from AniList. Try again shortly.
          </p>
        )}

        {!isError && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => <PosterCardSkeleton key={i} />)
              : data?.results.length === 0
              ? (
                <p className="col-span-full py-12 text-center text-sm text-muted">
                  Nothing listed for this season yet.
                </p>
              )
              : data?.results.map((anime) => (
                  <div key={anime.id}>
                    <PosterCard anime={anime} />
                    {anime.nextAiringEpisode && (
                      <p className="mt-1 text-xs text-sage">
                        Ep {anime.nextAiringEpisode.episode} · {formatTimeUntilAiring(anime.nextAiringEpisode.timeUntilAiring)}
                      </p>
                    )}
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
