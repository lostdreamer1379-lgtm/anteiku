import { useState } from "react";
import { ChevronLeft, ChevronRight, ListVideo } from "lucide-react";
import { Link } from "react-router-dom";
import type { WatchProgressEntry } from "@/types/anime";

interface EpisodeSidebarProps {
  animeId: number;
  animeTitle: string;
  coverImage: string;
  description: string | null;
  totalEpisodes: number;
  currentEpisode: number;
  isOpen: boolean;
  onToggle: () => void;
  progressFor: (animeId: number, episodeNumber: number) => WatchProgressEntry | undefined;
  isSignedIn: boolean;
}

function EpisodeItem({
  animeId,
  episode,
  animeTitle,
  coverImage,
  description,
  isCurrent,
  progress,
}: {
  animeId: number;
  episode: number;
  animeTitle: string;
  coverImage: string;
  description: string;
  isCurrent: boolean;
  progress: WatchProgressEntry | undefined;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-md border p-2 transition-colors ${isCurrent ? "border-sage/70 bg-forest/45" : "border-transparent hover:border-border-subtle hover:bg-bg-secondary"}`}>
      <Link
        to={`/watch/${animeId}/${episode}`}
        aria-current={isCurrent ? "page" : undefined}
        className="group flex min-w-0 gap-3"
      >
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-bg-secondary sm:h-[4.5rem] sm:w-28">
          {coverImage ? (
            <img src={coverImage} alt="" loading="lazy" onError={(event) => { event.currentTarget.src = "/anteiku-emblem.png"; }} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : <div className="h-full w-full bg-bg-secondary" />}
          <span className="absolute bottom-1 left-1 rounded bg-bg-primary/85 px-1.5 py-0.5 text-[0.65rem] font-medium text-ivory">{episode}</span>
          {progress && !progress.completed && <span className="absolute inset-x-1 bottom-0.5 h-0.5 overflow-hidden rounded-full bg-white/25"><span className="block h-full w-1/2 rounded-full bg-sage" /></span>}
        </div>
        <span className="min-w-0 py-0.5">
          <span className="block truncate text-sm text-ivory">Episode {episode}</span>
          <span className={`mt-1 block overflow-hidden text-[0.7rem] leading-4 text-muted transition-[max-height,opacity] duration-300 ease-out ${expanded ? "max-h-56 opacity-100" : "line-clamp-2 max-h-8 opacity-90"}`}>
            Episode {episode} of {animeTitle}. {description}
          </span>
          {progress?.completed && <span className="mt-1 block text-[0.65rem] text-sage">Completed</span>}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="ml-[calc(6rem+0.75rem)] mt-1 text-[0.65rem] font-medium text-sage transition-colors hover:text-ivory sm:ml-[calc(7rem+0.75rem)]"
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </div>
  );
}

export default function EpisodeSidebar({
  animeId,
  animeTitle,
  coverImage,
  description,
  totalEpisodes,
  currentEpisode,
  isOpen,
  onToggle,
  progressFor,
  isSignedIn,
}: EpisodeSidebarProps) {
  const synopsis = description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return (
    <aside
      className={`min-w-0 overflow-hidden rounded-anteiku border border-border-subtle bg-bg-card transition-[width] duration-300 ease-out lg:sticky lg:top-20 ${
        isOpen ? "lg:w-[22rem]" : "lg:w-14"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="episode-list"
        className={`flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left text-sm text-ivory transition-colors hover:bg-bg-secondary ${
          !isOpen ? "lg:justify-center lg:px-0" : "justify-between"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <ListVideo size={17} className="shrink-0 text-sage" />
          <span className={isOpen ? "truncate" : "sr-only"}>Episodes</span>
          {isOpen && <span className="text-xs text-muted">{currentEpisode}/{totalEpisodes}</span>}
        </span>
        {isOpen ? <ChevronRight size={17} className="shrink-0 text-muted lg:rotate-180" /> : <ChevronLeft size={17} className="hidden shrink-0 text-muted lg:block" />}
      </button>

      {isOpen && (
        <div id="episode-list" className="border-t border-border-subtle/70">
          <div className="max-h-[min(32rem,58vh)] overflow-y-auto p-2 lg:max-h-[calc(100vh-9rem)]">
            <div className="space-y-2">
              {Array.from({ length: totalEpisodes }, (_, index) => index + 1).map((episode) => {
                const progress = isSignedIn ? progressFor(animeId, episode) : undefined;
                const isCurrent = episode === currentEpisode;
                return (
                  <EpisodeItem
                    key={episode}
                    animeId={animeId}
                    episode={episode}
                    animeTitle={animeTitle}
                    coverImage={coverImage}
                    description={synopsis ?? `Continue watching ${animeTitle}, episode ${episode}.`}
                    isCurrent={isCurrent}
                    progress={progress}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
