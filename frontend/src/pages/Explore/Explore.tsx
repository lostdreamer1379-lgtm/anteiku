import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchAnime } from "@/hooks/useSearchAnime";
import PosterCard from "@/components/anime/PosterCard";
import PosterCardSkeleton from "@/components/ui/PosterCardSkeleton";
import { GENRES, FORMATS, SORTS } from "@/lib/constants";

const PER_PAGE = 24;

export default function Explore() {
  const [params, setParams] = useSearchParams();

  const search = params.get("q") ?? "";
  const genre = params.get("genre") ?? "";
  const format = params.get("format") ?? "";
  const sort = params.get("sort") ?? "POPULARITY_DESC";
  const page = Number(params.get("page") ?? "1");

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  }

  const effectiveSearch = debouncedSearch.trim();

  const queryParams = useMemo(
    () => ({
      search: effectiveSearch || undefined,
      genre: genre ? [genre] : undefined,
      format: format || undefined,
      sort: [sort],
      page,
      perPage: PER_PAGE,
    }),
    [effectiveSearch, genre, format, sort, page]
  );

  const { data, isLoading, isFetching, isError } = useSearchAnime(queryParams);

  const hasFilters = Boolean(search || genre || format);

  function clearFilters() {
    setSearchInput("");
    setParams({});
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <h1 className="font-serif text-3xl text-ivory">Explore</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Search the full AniList catalog, or narrow it down by genre, format and sort.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="relative">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              updateParam("q", e.target.value);
            }}
            placeholder="Search by title…"
            aria-label="Search anime by title"
            className="w-full rounded-anteiku border border-border-subtle bg-bg-card py-2.5 pl-11 pr-10 text-sm text-ivory placeholder:text-muted focus:border-sage focus:outline-none"
          />
          {searchInput && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearchInput("");
                updateParam("q", "");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ivory"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={genre}
            onChange={(e) => updateParam("genre", e.target.value)}
            aria-label="Filter by genre"
            className="rounded-anteiku border border-border-subtle bg-bg-card px-3 py-2 text-sm text-ivory focus:border-sage focus:outline-none"
          >
            <option value="">All genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={format}
            onChange={(e) => updateParam("format", e.target.value)}
            aria-label="Filter by format"
            className="rounded-anteiku border border-border-subtle bg-bg-card px-3 py-2 text-sm text-ivory focus:border-sage focus:outline-none"
          >
            <option value="">All formats</option>
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            aria-label="Sort by"
            className="rounded-anteiku border border-border-subtle bg-bg-card px-3 py-2 text-sm text-ivory focus:border-sage focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>Sort: {s.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-muted underline-offset-2 hover:text-ivory hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        {isError && (
          <p className="rounded-anteiku border border-border-subtle bg-bg-card p-4 text-sm text-muted">
            Something went wrong talking to AniList. Try again in a moment.
          </p>
        )}

        {!isError && (
          <>
            {data && (
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-sage">
                {data.total.toLocaleString()} results
              </p>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => <PosterCardSkeleton key={i} />)
                : data?.results.length === 0
                ? (
                  <p className="col-span-full py-12 text-center text-sm text-muted">
                    No anime matched that search. Try a different title or clear your filters.
                  </p>
                )
                : data?.results.map((anime) => <PosterCard key={anime.id} anime={anime} />)}
            </div>

            {data && data.results.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => updateParam("page", String(page - 1))}
                  className="rounded-anteiku border border-border-subtle px-4 py-2 text-sm text-ivory disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-muted">
                  Page {page}{isFetching && " · loading…"}
                </span>
                <button
                  type="button"
                  disabled={!data.hasNextPage}
                  onClick={() => updateParam("page", String(page + 1))}
                  className="rounded-anteiku border border-border-subtle px-4 py-2 text-sm text-ivory disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
