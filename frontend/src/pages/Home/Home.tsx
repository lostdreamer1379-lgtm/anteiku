import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeCarousels } from "@/hooks/useHomeCarousels";
import { useSearchAnime } from "@/hooks/useSearchAnime";
import PosterCarousel from "@/components/anime/PosterCarousel";
import PosterCard from "@/components/anime/PosterCard";
import PosterCardSkeleton from "@/components/ui/PosterCardSkeleton";

const genres = [
  "Action", "Adventure", "Romance", "Psychological", "Thriller",
  "Mystery", "Slice of Life", "Fantasy", "Sci-Fi",
];

const collections = [
  {
    title: "After Dark",
    blurb: "Stories best watched once the lights are low.",
    genres: ["Mystery", "Thriller"],
  },
  {
    title: "Quiet Evenings",
    blurb: "Slow, warm, unhurried watches.",
    genres: ["Slice of Life", "Romance"],
  },
  {
    title: "Psychological Depths",
    blurb: "Minds unravelling, one episode at a time.",
    genres: ["Psychological"],
  },
  {
    title: "Timeless Classics",
    blurb: "The ones that started it all.",
    genres: ["Drama"],
    sort: ["SCORE_DESC"],
  },
  {
    title: "Beyond Reality",
    blurb: "Worlds that don't play by our rules.",
    genres: ["Fantasy", "Sci-Fi"],
  },
];

type Collection = (typeof collections)[number];

function CollectionResults({ collection, isOpen }: { collection: Collection; isOpen: boolean }) {
  const query = useSearchAnime(
    {
      genre: collection.genres,
      sort: collection.sort ?? ["POPULARITY_DESC"],
      perPage: 24,
    },
    isOpen,
  );

  return (
    <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
      <div className="min-h-0 overflow-hidden">
        <div className="border-t border-border-subtle/70 px-4 pb-5 pt-4 sm:px-5">
          {query.isLoading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <PosterCardSkeleton key={index} variant="grid" />
              ))}
            </div>
          ) : query.isError ? (
            <p className="text-sm text-muted">We could not load this collection. Please try again.</p>
          ) : query.data?.results.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
              {query.data.results.map((anime) => (
                <PosterCard key={anime.id} anime={anime} variant="grid" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Nothing here yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { trending, airing, seasonal } = useHomeCarousels();
  const [openCollection, setOpenCollection] = useState<string | null>(null);
  const hero = trending.data?.[0];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border-subtle/60">
        <div className="relative mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-end gap-4 px-5 py-16 md:px-8">
          {hero?.bannerImage && (
            <img
              src={hero.bannerImage}
              alt=""
              aria-hidden
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg-primary via-bg-primary/70 to-bg-primary/20" />

          {trending.isLoading && <div className="h-10 w-2/3 animate-pulse rounded bg-bg-card" />}

          {hero && (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-sage">Featured</p>
              <h1 className="max-w-2xl font-serif text-4xl text-ivory md:text-5xl">
                {hero.title.english ?? hero.title.romaji}
              </h1>
              <p className="text-sm text-muted">
                {[hero.format, hero.year, ...hero.genres.slice(0, 3)].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  to={`/anime/${hero.id}`}
                  className="rounded-anteiku bg-forest px-5 py-2.5 text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-sage hover:text-bg-primary"
                >
                  View Details
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <PosterCarousel title="Trending Now" items={trending.data ?? []} isLoading={trending.isLoading} />
      <PosterCarousel
        title="Currently Airing"
        items={airing.data?.results ?? []}
        isLoading={airing.isLoading}
      />
      <PosterCarousel
        title="This Season"
        items={seasonal.data?.results ?? []}
        isLoading={seasonal.isLoading}
      />

      {/* GENRES */}
      <section className="px-5 py-10 md:px-8">
        <h2 className="mb-4 font-serif text-xl text-ivory">Browse by Genre</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Link
              key={genre}
              to={`/explore?genre=${encodeURIComponent(genre)}`}
              className="rounded-anteiku border border-border-subtle px-4 py-2 text-sm text-muted transition-colors hover:border-sage hover:text-ivory"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL COLLECTIONS */}
      <section className="px-5 py-10 md:px-8">
        <h2 className="mb-4 font-serif text-xl text-ivory">Curated Collections</h2>
        <p className="mb-5 max-w-xl text-sm text-muted">
          Hand-picked groupings for a mood, not an official classification.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <article
              key={c.title}
              className={`overflow-hidden rounded-anteiku border bg-bg-card transition-[border-color,box-shadow] duration-300 ${openCollection === c.title ? "border-sage/70 shadow-[var(--shadow-soft)] lg:col-span-3" : "border-border-subtle hover:border-sage/60"}`}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                aria-expanded={openCollection === c.title}
                aria-controls={`collection-${c.title.replaceAll(" ", "-").toLowerCase()}`}
                onClick={() => setOpenCollection((current) => current === c.title ? null : c.title)}
              >
                <span>
                  <span className="block font-serif text-lg text-ivory">{c.title}</span>
                  <span className="mt-1.5 block text-sm text-muted">{c.blurb}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.16em] text-sage">
                  <span className="hidden sm:inline">{openCollection === c.title ? "Close" : "Explore"}</span>
                  <ChevronDown size={18} className={`transition-transform duration-500 ${openCollection === c.title ? "rotate-180" : ""}`} aria-hidden />
                </span>
              </button>
              <div id={`collection-${c.title.replaceAll(" ", "-").toLowerCase()}`}>
                <CollectionResults collection={c} isOpen={openCollection === c.title} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
