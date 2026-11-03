import { useState } from "react";
import { BookOpen, Search, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useComixSearch } from "@/hooks/useComixSearch";
import { useComixHome } from "@/hooks/useComixManga";
import type { ComixManga } from "@/services/comix";

function MangaCard({ manga }: { manga: ComixManga }) {
  return (
    <Link to={`/manga/${encodeURIComponent(manga.id)}`} className="group min-w-0">
      <div className="relative aspect-[2/3] overflow-hidden rounded-anteiku bg-bg-card">
        {manga.img ? (
          <img src={manga.img} alt={manga.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : <div className="flex h-full items-center justify-center text-xs text-muted">No cover</div>}
        {manga.score !== undefined && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-bg-primary/85 px-2 py-1 text-[0.65rem] text-ivory backdrop-blur">
            <Star size={11} className="fill-sage text-sage" />{manga.score.toFixed(1)}
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-ivory">{manga.title}</p>
      <p className="mt-1 truncate text-xs capitalize text-muted">{manga.type ?? "manga"}</p>
    </Link>
  );
}

function MangaRail({ title, items }: { title: string; items: ComixManga[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-serif text-xl text-ivory">{title}</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {items.slice(0, 16).map((manga) => <MangaCard key={manga.id} manga={manga} />)}
      </div>
    </section>
  );
}

export default function Manga() {
  const [searchInput, setSearchInput] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const search = useDebouncedValue(searchInput.trim(), 250);
  const searchQuery = useComixSearch(search);
  const homeQuery = useComixHome();

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-sage">The reading room</p>
        <h1 className="mt-2 font-serif text-4xl text-ivory md:text-5xl">Manga</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Search manga and manhwa, then settle into a clean, focused reader.</p>
      </div>

      <div className="relative mt-8 max-w-3xl">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => { setSearchInput(event.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search manga, manhwa or manhua…"
          aria-label="Search manga"
          aria-expanded={searchOpen && Boolean(search)}
          className="h-12 w-full rounded-anteiku border border-border-subtle bg-bg-card pl-11 pr-4 text-sm text-ivory placeholder:text-muted focus:border-sage focus:outline-none"
        />
        {searchOpen && search && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-anteiku border border-border-subtle bg-bg-card shadow-[var(--shadow-soft)]">
            {searchQuery.isLoading ? <p className="p-4 text-sm text-muted">Searching Comix…</p> : searchQuery.data?.length ? (
              <div className="p-1.5">
                {searchQuery.data.slice(0, 6).map((manga) => (
                  <Link key={manga.id} to={`/manga/${encodeURIComponent(manga.id)}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-md p-2.5 hover:bg-bg-secondary">
                    {manga.img ? <img src={manga.img} alt="" className="h-12 w-9 rounded object-cover" /> : <BookOpen size={18} className="mx-2 text-sage" />}
                    <span className="min-w-0"><span className="block truncate text-sm text-ivory">{manga.title}</span><span className="text-xs capitalize text-muted">{manga.type ?? "manga"}</span></span>
                  </Link>
                ))}
              </div>
            ) : <p className="p-4 text-sm text-muted">No manga found.</p>}
          </div>
        )}
      </div>

      {search ? (
        <section className="mt-10">
          <h2 className="mb-4 font-serif text-xl text-ivory">Search results</h2>
          {searchQuery.isError ? <p className="text-sm text-muted">Comix search is unavailable right now. Try again shortly.</p> : searchQuery.isLoading ? <div className="h-40 animate-pulse rounded-anteiku bg-bg-card" /> : searchQuery.data?.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">{searchQuery.data.map((manga) => <MangaCard key={manga.id} manga={manga} />)}</div> : <p className="text-sm text-muted">No manga matched that title.</p>}
        </section>
      ) : (
        <>
          {homeQuery.isError ? <p className="mt-10 rounded-anteiku border border-border-subtle bg-bg-card p-4 text-sm text-muted">Manga discovery is unavailable right now. Try searching again later.</p> : homeQuery.isLoading ? <div className="mt-10 h-64 animate-pulse rounded-anteiku bg-bg-card" /> : <><MangaRail title="Trending now" items={homeQuery.data?.popular ?? []} /><MangaRail title="Latest updates" items={homeQuery.data?.latest ?? []} /></>}
        </>
      )}
    </div>
  );
}
