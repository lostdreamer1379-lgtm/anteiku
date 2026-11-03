import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAnimeDetails } from "@/hooks/useAnimeDetails";
import type { WatchStatus, WatchlistEntry } from "@/types/anime";

const STATUS_TABS: { value: WatchStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "WATCHING", label: "Watching" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PLANNING", label: "Planning" },
  { value: "PAUSED", label: "Paused" },
  { value: "DROPPED", label: "Dropped" },
];

const STATUS_LABELS: Record<WatchStatus, string> = {
  WATCHING: "Watching",
  COMPLETED: "Completed",
  PLANNING: "Planning",
  PAUSED: "Paused",
  DROPPED: "Dropped",
};

function StatusMenu({ entry, onChange }: { entry: WatchlistEntry; onChange: (status: WatchStatus) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-w-32 items-center justify-between gap-3 rounded-anteiku border border-border-subtle bg-bg-card px-3 py-2 text-xs text-ivory shadow-[var(--shadow-soft)] transition-colors hover:border-sage focus:border-sage focus:outline-none"
      >
        {STATUS_LABELS[entry.status]}
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="listbox" className="absolute right-0 top-[calc(100%+0.4rem)] z-30 min-w-40 overflow-hidden rounded-anteiku border border-border-subtle bg-bg-card p-1 shadow-[var(--shadow-soft)]">
          {Object.entries(STATUS_LABELS).map(([value, label]) => {
            const status = value as WatchStatus;
            return (
              <button
                key={status}
                type="button"
                role="option"
                aria-selected={entry.status === status}
                onClick={() => { onChange(status); setOpen(false); }}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-muted transition-colors hover:bg-bg-secondary hover:text-ivory aria-selected:bg-forest/50 aria-selected:text-ivory"
              >
                {label}
                {entry.status === status && <Check size={13} className="text-sage" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WatchlistRow({ entry, onStatusChange, onRemove }: { entry: WatchlistEntry; onStatusChange: (status: WatchStatus) => void; onRemove: () => void }) {
  const { data: anime, isLoading } = useAnimeDetails(entry.animeId);
  const title = anime ? (anime.title.english ?? anime.title.romaji) : `Anime #${entry.animeId}`;

  return (
    <li className="flex flex-col gap-4 border-b border-border-subtle/60 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-20 w-14 shrink-0 overflow-hidden rounded-anteiku bg-bg-card">
          {anime?.coverImage ? <img src={anime.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="h-full w-full animate-pulse bg-bg-secondary" />}
        </div>
        <div className="min-w-0">
          <Link to={`/anime/${entry.animeId}`} className="line-clamp-2 text-sm font-medium text-ivory hover:text-sage">
            {isLoading ? "Loading anime…" : title}
          </Link>
          <p className="mt-1 text-xs text-muted">{STATUS_LABELS[entry.status]} · {new Date(entry.updatedAt).toLocaleDateString()}</p>
          {anime && <p className="mt-1 truncate text-xs text-muted">{[anime.format, anime.year].filter(Boolean).join(" · ")}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <StatusMenu entry={entry} onChange={onStatusChange} />
        <button type="button" aria-label={`Remove ${title} from watchlist`} onClick={onRemove} className="rounded-anteiku p-2 text-muted transition-colors hover:bg-bg-secondary hover:text-red-400">
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

export default function Watchlist() {
  const { user } = useAuth();
  const { query, update, remove } = useWatchlist();
  const [activeTab, setActiveTab] = useState<WatchStatus | "ALL">("ALL");

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-sage">Your list</p>
        <h1 className="mt-2 font-serif text-3xl text-ivory">Watchlist</h1>
        <p className="mt-4 text-sm text-muted">
          <Link to="/signin" className="text-sage hover:underline">
            Sign in
          </Link>{" "}
          to see and manage your anime list.
        </p>
      </div>
    );
  }

  const entries = query.data ?? [];
  const filtered = entries.filter((entry) =>
    activeTab === "ALL" || entry.status === activeTab
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 md:px-8">
      <h1 className="font-serif text-3xl text-ivory">Watchlist</h1>
      <p className="mt-1 text-sm text-muted">
        {entries.length} {entries.length === 1 ? "title" : "titles"} tracked
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border-subtle pb-px">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === "ALL"
              ? entries.length
              : entries.filter((e) => e.status === tab.value).length;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 border-b-2 px-4 py-2 text-sm transition-colors ${
                activeTab === tab.value
                  ? "border-sage text-ivory"
                  : "border-transparent text-muted hover:text-ivory"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 rounded-full bg-bg-card px-1.5 py-0.5 text-xs text-muted">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading / empty / list */}
      {query.isLoading && (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-anteiku bg-bg-card" />
          ))}
        </div>
      )}

      {!query.isLoading && filtered.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted">
            {activeTab === "ALL"
              ? "Your watchlist is empty. Browse anime and start tracking."
              : `Nothing marked as ${STATUS_LABELS[activeTab as WatchStatus]} yet.`}
          </p>
          <Link
            to="/explore"
            className="mt-4 inline-block text-sm text-sage hover:underline"
          >
            Explore anime →
          </Link>
        </div>
      )}

      {!query.isLoading && filtered.length > 0 && (
        <ul className="mt-4">
          {filtered.map((entry) => (
            <WatchlistRow key={entry.id} entry={entry} onStatusChange={(status) => update.mutate({ id: entry.id, status })} onRemove={() => remove.mutate(entry.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}
