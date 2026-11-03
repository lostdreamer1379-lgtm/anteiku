import { Check, Clock, PauseCircle, XCircle, BookmarkPlus } from "lucide-react";
import clsx from "clsx";
import type { WatchStatus } from "@/types/anime";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { getLocalStatus } from "@/lib/localWatchlist";
import { useState } from "react";
import { Link } from "react-router-dom";

const OPTIONS: { value: WatchStatus; label: string; icon: typeof Check }[] = [
  { value: "WATCHING", label: "Watching", icon: Clock },
  { value: "COMPLETED", label: "Completed", icon: Check },
  { value: "PLANNING", label: "Planning", icon: BookmarkPlus },
  { value: "PAUSED", label: "Paused", icon: PauseCircle },
  { value: "DROPPED", label: "Dropped", icon: XCircle },
];

// When signed in: reads/writes against the backend API via useWatchlist.
// When signed out: falls back to localStorage and prompts sign in.
export default function WatchStatusButtons({ animeId }: { animeId: number }) {
  const { user } = useAuth();
  const { statusFor, add, update, remove } = useWatchlist();

  // Local-only fallback state (not shown when signed in)
  const [localStatus] = useState<WatchStatus | null>(() =>
    user ? null : getLocalStatus(animeId)
  );

  if (!user) {
    return (
      <div>
        <div className="flex flex-wrap gap-2 opacity-60">
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <div
              key={value}
              className={clsx(
                "flex items-center gap-1.5 rounded-anteiku border px-3.5 py-2 text-sm",
                localStatus === value
                  ? "border-sage bg-forest text-ivory"
                  : "border-border-subtle text-muted"
              )}
            >
              <Icon size={14} />
              {label}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          <Link to="/signin" className="text-sage underline-offset-2 hover:underline">
            Sign in
          </Link>{" "}
          to track this anime across devices.
        </p>
      </div>
    );
  }

  const entry = statusFor(animeId);
  const currentStatus = entry?.status ?? null;

  function choose(value: WatchStatus) {
    if (currentStatus === value) {
      // Toggle off — remove from watchlist
      if (entry) remove.mutate(entry.id);
    } else if (entry) {
      // Change status on existing entry
      update.mutate({ id: entry.id, status: value });
    } else {
      // New entry
      add.mutate({ animeId, status: value });
    }
  }

  const busy = add.isPending || update.isPending || remove.isPending;

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = currentStatus === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            disabled={busy}
            aria-pressed={active}
            className={clsx(
              "flex items-center gap-1.5 rounded-anteiku border px-3.5 py-2 text-sm transition-colors",
              active
                ? "border-sage bg-forest text-ivory"
                : "border-border-subtle text-muted hover:border-sage hover:text-ivory",
              busy && "cursor-not-allowed opacity-60"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
