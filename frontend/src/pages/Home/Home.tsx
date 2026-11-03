import { Link } from "react-router-dom";
import { useHomeCarousels } from "@/hooks/useHomeCarousels";
import PosterCarousel from "@/components/anime/PosterCarousel";

const genres = [
  "Action", "Adventure", "Romance", "Psychological", "Thriller",
  "Mystery", "Slice of Life", "Fantasy", "Sci-Fi",
];

const collections = [
  { title: "After Dark", blurb: "Stories best watched once the lights are low." },
  { title: "Quiet Evenings", blurb: "Slow, warm, unhurried watches." },
  { title: "Psychological Depths", blurb: "Minds unravelling, one episode at a time." },
  { title: "Timeless Classics", blurb: "The ones that started it all." },
  { title: "Beyond Reality", blurb: "Worlds that don't play by our rules." },
];

export default function Home() {
  const { trending, airing, seasonal } = useHomeCarousels();
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <div
              key={c.title}
              className="rounded-anteiku border border-border-subtle bg-bg-card p-5 transition-colors hover:border-sage/60"
            >
              <p className="font-serif text-lg text-ivory">{c.title}</p>
              <p className="mt-1.5 text-sm text-muted">{c.blurb}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
