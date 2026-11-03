import { useParams, Link } from "react-router-dom";
import { Star, PlayCircle, BookOpen } from "lucide-react";
import { useAnimeDetails } from "@/hooks/useAnimeDetails";
import { useComixSearch } from "@/hooks/useComixSearch";
import WatchStatusButtons from "@/components/anime/WatchStatusButtons";
import PosterCarousel from "@/components/anime/PosterCarousel";

export default function AnimeDetails() {
  const { id } = useParams();
  const animeId = Number(id);
  const { data: anime, isLoading, isError } = useAnimeDetails(animeId);

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
        <p className="text-sm text-muted">Couldn't load this title from AniList.</p>
        <Link to="/explore" className="mt-3 inline-block text-sm text-sage hover:underline">
          Back to Explore
        </Link>
      </div>
    );
  }

  if (isLoading || !anime) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse px-5 py-16 md:px-8">
        <div className="h-64 rounded-anteiku bg-bg-card" />
        <div className="mt-6 h-8 w-1/2 rounded bg-bg-card" />
        <div className="mt-3 h-4 w-1/3 rounded bg-bg-card" />
      </div>
    );
  }

  const title = anime.title.english ?? anime.title.romaji;
  const { data: mangaResults, isLoading: mangaLoading } = useComixSearch(title);

  return (
    <div>
      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden border-b border-border-subtle/60 md:h-72">
        {anime.bannerImage ? (
          <img src={anime.bannerImage} alt="" aria-hidden className="h-full w-full object-cover opacity-40" />
        ) : (
          <div className="h-full w-full bg-bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
      </div>

      <div className="mx-auto -mt-24 max-w-5xl px-5 pb-16 md:-mt-28 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Cover */}
          <div className="w-40 shrink-0 overflow-hidden rounded-anteiku border border-border-subtle shadow-soft md:w-56">
            {anime.coverImage ? (
              <img src={anime.coverImage} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="aspect-[2/3] bg-bg-card" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <p className="text-xs uppercase tracking-[0.3em] text-sage">
              {[anime.format, anime.status].filter(Boolean).join(" · ")}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-ivory md:text-4xl">{title}</h1>
            {anime.title.native && (
              <p className="mt-1 text-sm text-muted">{anime.title.native}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
              {anime.averageScore !== null && (
                <span className="flex items-center gap-1">
                  <Star size={14} className="fill-sage text-sage" />
                  {(anime.averageScore / 10).toFixed(1)}
                </span>
              )}
              {anime.episodes && <span>{anime.episodes} episodes</span>}
              {anime.year && <span>{anime.year}</span>}
              {anime.studios.length > 0 && <span>{anime.studios.join(", ")}</span>}
            </div>

            {anime.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <Link
                    key={g}
                    to={`/explore?genre=${encodeURIComponent(g)}`}
                    className="rounded-anteiku border border-border-subtle px-3 py-1 text-xs text-muted hover:border-sage hover:text-ivory"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}

            {anime.description && (
              <p
                className="mt-5 max-w-2xl text-sm leading-relaxed text-muted"
                // AniList descriptions may include basic HTML (e.g. <br>, <i>, <b>, <a>)
                // when asHtml is requested; we request plain text (asHtml: false) so
                // this is already stripped/plain, kept as textContent rather than
                // dangerouslySetInnerHTML to avoid injecting markup from a third party.
              >
                {anime.description.replace(/<[^>]+>/g, " ")}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to={`/watch/${anime.id}/1`}
                className="flex items-center gap-2 rounded-anteiku bg-forest px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-sage hover:text-bg-primary"
              >
                <PlayCircle size={16} />
                Start Watching
              </Link>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-sage">Your status</p>
              <WatchStatusButtons animeId={anime.id} />
            </div>

            {(mangaLoading || mangaResults?.length) && (
              <section className="mt-7" aria-labelledby="manga-heading">
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-sage" aria-hidden="true" />
                  <h2 id="manga-heading" className="text-xs uppercase tracking-[0.2em] text-sage">Manga adaptation</h2>
                </div>
                {mangaLoading ? (
                  <div className="mt-3 h-16 animate-pulse rounded-anteiku bg-bg-card" />
                ) : (
                  <div className="mt-3 space-y-2">
                    {mangaResults?.slice(0, 1).map((manga) => (
                      <div
                        key={manga.id}
                        className="flex items-start gap-3 rounded-anteiku border border-border-subtle bg-bg-card p-3"
                      >
                        {manga.img ? (
                          <img src={manga.img} alt={`${manga.title} cover`} onError={(event) => { event.currentTarget.src = "/coffee-icon.svg"; }} className="h-20 w-14 shrink-0 rounded object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-bg-secondary text-muted"><BookOpen size={15} /></div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-ivory">{manga.title}</p>
                          <p className="mt-2 text-xs leading-5 text-muted">This anime is adapted from or associated with this {manga.type ?? "manga"}. The manga is shown for context only and cannot be opened from here.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {anime.related.length > 0 && (
        <PosterCarousel title="Related" items={anime.related} />
      )}
      {anime.recommendations.length > 0 && (
        <PosterCarousel title="Recommended" items={anime.recommendations} />
      )}
    </div>
  );
}
