import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeCarousels } from "@/hooks/useHomeCarousels";
import { useSearchAnime } from "@/hooks/useSearchAnime";
import PosterCarousel from "@/components/anime/PosterCarousel";
import PosterCard from "@/components/anime/PosterCard";
import PosterCardSkeleton from "@/components/ui/PosterCardSkeleton";
import type { AnimeSummary } from "@/types/anime";

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

type HeroPhase = "focus" | "zoom-out" | "wheel";

function HeroWheel({ items, selectedIndex, onChange }: {
  items: AnimeSummary[];
  selectedIndex: number;
  onChange: (direction: 1 | -1) => void;
}) {
  const [phase, setPhase] = useState<HeroPhase>("focus");
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const rotate = useCallback((direction: 1 | -1) => {
    if (items.length < 2 || phaseRef.current !== "focus") return;

    setPhase("zoom-out");
    const wheelTimer = window.setTimeout(() => {
      onChange(direction);
      setPhase("wheel");
    }, 450);
    const focusTimer = window.setTimeout(() => setPhase("focus"), 1_150);
    timers.current.push(wheelTimer, focusTimer);
  }, [items.length, onChange]);

  useEffect(() => {
    if (items.length < 2) return;
    const interval = window.setInterval(() => rotate(1), 5_800);
    return () => window.clearInterval(interval);
  }, [items.length, rotate]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  if (!items.length) {
    return <div className="mx-auto h-[17rem] w-[17rem] animate-pulse rounded-full bg-bg-card/60 sm:h-[22rem] sm:w-[22rem]" />;
  }

  const step = 360 / items.length;
  const rotation = -(selectedIndex * step);
  const phaseScale = phase === "focus" ? "scale-[1.02]" : "scale-[0.7]";

  return (
    <div
      className="relative mx-auto h-[18rem] w-full max-w-[24rem] touch-pan-y select-none sm:h-[24rem] sm:max-w-[30rem]"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = event.clientX;
        setIsDragging(true);
      }}
      onPointerUp={(event) => {
        if (dragStart.current !== null) {
          const distance = event.clientX - dragStart.current;
          if (Math.abs(distance) > 42) rotate(distance < 0 ? 1 : -1);
        }
        event.currentTarget.releasePointerCapture(event.pointerId);
        dragStart.current = null;
        setIsDragging(false);
      }}
      onPointerCancel={() => {
        dragStart.current = null;
        setIsDragging(false);
      }}
    >
      <div className={`absolute inset-0 transition-transform duration-700 [perspective:1000px] ${phaseScale} ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}>
        <div
          className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]"
          style={{ transform: `rotateY(${rotation}deg)` }}
        >
          {items.map((anime, index) => {
            const title = anime.title.english ?? anime.title.romaji;
            return (
              <Link
                key={anime.id}
                to={`/anime/${anime.id}`}
                aria-label={`View ${title}`}
                className="absolute left-1/2 top-1/2 h-40 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-anteiku border border-ivory/15 bg-bg-card shadow-[0_18px_35px_rgba(0,0,0,0.45)] transition-[filter,opacity] duration-500 sm:h-52 sm:w-36"
                style={{
                  transform: `rotateY(${index * step}deg) translateZ(clamp(7.2rem, 23vw, 12.5rem))`,
                  backfaceVisibility: "hidden",
                  opacity: index === selectedIndex ? 1 : 0.82,
                }}
              >
                <img src={anime.coverImage} alt="" draggable={false} className="h-full w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent px-2 pb-2 pt-8 text-[0.65rem] leading-tight text-ivory sm:text-xs">
                  {title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous featured anime"
        onClick={() => rotate(-1)}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border-subtle bg-bg-primary/80 p-2 text-ivory backdrop-blur transition-colors hover:border-sage hover:text-sage sm:left-2"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Next featured anime"
        onClick={() => rotate(1)}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border-subtle bg-bg-primary/80 p-2 text-ivory backdrop-blur transition-colors hover:border-sage hover:text-sage sm:right-2"
      >
        <ChevronRight size={18} />
      </button>
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-1.5" aria-label="Featured anime position">
        {items.slice(0, 8).map((anime, index) => (
          <span key={anime.id} className={`h-1.5 rounded-full transition-all duration-300 ${index === selectedIndex ? "w-5 bg-sage" : "w-1.5 bg-muted/50"}`} />
        ))}
      </div>
    </div>
  );
}

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
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] [touch-action:pan-x]">
              {Array.from({ length: 8 }).map((_, index) => (
                <PosterCardSkeleton key={index} variant="compact" />
              ))}
            </div>
          ) : query.isError ? (
            <p className="text-sm text-muted">We could not load this collection. Please try again.</p>
          ) : query.data?.results.length ? (
            <div
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] [touch-action:pan-x] overscroll-x-contain"
              style={{ WebkitOverflowScrolling: "touch" }}
              aria-label={`${collection.title} anime list`}
            >
              {query.data.results.map((anime) => (
                <PosterCard key={anime.id} anime={anime} variant="compact" />
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
  const heroItems = trending.data ?? [];
  const [heroIndex, setHeroIndex] = useState(0);
  const hero = heroItems[heroIndex] ?? heroItems[0];
  const changeHero = useCallback((direction: 1 | -1) => {
    setHeroIndex((current) => (current + direction + heroItems.length) % heroItems.length);
  }, [heroItems.length]);

  useEffect(() => {
    setHeroIndex(0);
  }, [heroItems.length]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border-subtle/60">
        <div className="relative mx-auto grid min-h-[60vh] max-w-7xl items-center gap-8 px-5 py-12 md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] md:px-8 md:py-16">
          {hero?.bannerImage && (
            <img
              src={hero.bannerImage}
              alt=""
              aria-hidden
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg-primary via-bg-primary/70 to-bg-primary/20" />

          <div className="relative z-10 flex flex-col justify-center gap-4">
            {trending.isLoading && <div className="h-10 w-2/3 animate-pulse rounded bg-bg-card" />}

            {hero && (
              <>
                <p className="text-xs uppercase tracking-[0.3em] text-sage">Featured · Trending now</p>
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

          <div className="relative z-10">
            <HeroWheel items={heroItems} selectedIndex={heroIndex} onChange={changeHero} />
          </div>
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
