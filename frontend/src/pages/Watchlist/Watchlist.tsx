import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { WatchStatus } from "@/types/anime";

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
        <ul className="mt-4 divide-y divide-border-subtle/60">
          {filtered.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex flex-col gap-1">
                <Link
                  to={`/anime/${entry.animeId}`}
                  className="text-sm font-medium text-ivory hover:text-sage"
                >
                  Anime #{entry.animeId}
                </Link>
                <p className="text-xs text-muted">
                  {STATUS_LABELS[entry.status]} ·{" "}
                  {new Date(entry.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={entry.status}
                  aria-label="Change status"
                  onChange={(e) =>
                    update.mutate({ id: entry.id, status: e.target.value as WatchStatus })
                  }
                  className="rounded-anteiku border border-border-subtle bg-bg-card px-2 py-1 text-xs text-ivory focus:border-sage focus:outline-none"
                >
                  {(["WATCHING", "COMPLETED", "PLANNING", "PAUSED", "DROPPED"] as WatchStatus[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  aria-label="Remove from watchlist"
                  onClick={() => remove.mutate(entry.id)}
                  className="rounded-anteiku p-1.5 text-muted hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
