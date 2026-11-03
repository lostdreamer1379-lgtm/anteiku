import { useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import Player from "@/components/player/Player";
import { useAnimeDetails } from "@/hooks/useAnimeDetails";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthContext";
import { resolveProvider } from "@/components/player/providers/PlaybackProvider";

export default function Watch() {
  const { id, episode } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const playbackProvider = resolveProvider();
  const dub = searchParams.get("dub") === "1";

  const animeId = Number(id);
  const episodeNumber = Number(episode);

  const { data: anime } = useAnimeDetails(animeId);
  const { query: progressQuery, progressFor, upsert } = useProgress();
  const startedEpisodeRef = useRef<string | null>(null);

  const totalEpisodes = anime?.episodes ?? 99;
  const savedEntry = user ? progressFor(animeId, episodeNumber) : undefined;
  const savedProgressSeconds = savedEntry?.progressSeconds ?? 0;

  useEffect(() => {
    const episodeKey = `${animeId}-${episodeNumber}`;
    if (!user || progressQuery.isLoading || startedEpisodeRef.current === episodeKey) return;

    startedEpisodeRef.current = episodeKey;
    upsert.mutate({
      animeId,
      episodeNumber,
      progressSeconds: savedProgressSeconds,
      completed: false,
    });
  }, [animeId, episodeNumber, progressQuery.isLoading, savedProgressSeconds, upsert, user]);

  const animeTitle = anime
    ? (anime.title.english ?? anime.title.romaji)
    : `Anime #${animeId}`;

  function handleProgressUpdate(seconds: number) {
    if (!user) return;
    upsert.mutate({ animeId, episodeNumber, progressSeconds: seconds, completed: false });
  }

  function handleEpisodeComplete() {
    if (user) {
      upsert.mutate({
        animeId,
        episodeNumber,
        progressSeconds: 0,
        completed: true,
      });
    }
    if (episodeNumber < totalEpisodes) {
      navigate(`/watch/${animeId}/${episodeNumber + 1}`);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to={`/anime/${animeId}`}
          className="flex items-center gap-2 text-sm text-muted hover:text-ivory"
        >
          <ArrowLeft size={16} />
          {animeTitle}
        </Link>
        <div className="flex items-center gap-3">
          {playbackProvider.kind === "iframe" && (
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (dub) next.delete("dub");
                else next.set("dub", "1");
                setSearchParams(next);
              }}
              aria-pressed={dub}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                dub ? "border-sage bg-forest text-ivory" : "border-border-subtle text-muted hover:border-sage hover:text-ivory"
              }`}
            >
              English dub {dub ? "on" : "off"}
            </button>
          )}
          <span className="text-sm text-muted">Episode {episodeNumber}</span>
        </div>
      </div>

      {/* Player */}
      <Player
        key={`${animeId}-${episodeNumber}-${dub ? "dub" : "sub"}`}
        episode={{ animeId, episodeNumber, title: anime?.title.english ?? anime?.title.romaji }}
        totalEpisodes={totalEpisodes}
        savedProgressSeconds={savedProgressSeconds}
        resumeReady={!user || !progressQuery.isLoading}
        dub={dub}
        onProgressUpdate={handleProgressUpdate}
        onEpisodeComplete={handleEpisodeComplete}
        onExit={() => navigate(`/anime/${animeId}`)}
        onPrevEpisode={
          episodeNumber > 1
            ? () => navigate(`/watch/${animeId}/${episodeNumber - 1}`)
            : undefined
        }
        onNextEpisode={
          episodeNumber < totalEpisodes
            ? () => navigate(`/watch/${animeId}/${episodeNumber + 1}`)
            : undefined
        }
      />

      {/* Playback provider notice */}
      <div className="mt-4 flex items-start gap-2 rounded-anteiku border border-border-subtle/60 bg-bg-card px-4 py-3">
        <Info size={14} className="mt-0.5 shrink-0 text-sage" />
        {playbackProvider.kind === "iframe" ? (
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-medium text-ivory">VidRift player active.</span>{" "}
            Playback is provided by a third-party iframe. Use the player’s server, audio and subtitle
            menus to choose an available source. Some AniList entries may not have a VidRift mapping
            or working source. Anteiku does not host the stream; use embeds only for content you are
            authorised to display. VidRift does not require a separate API key.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-medium text-ivory">Demo playback active.</span>{" "}
            Sample videos are playing to demonstrate the player interface and progress tracking;
            they are not real anime episodes. Set <code className="text-sage">VITE_PLAYBACK_PROVIDER=vidrift</code>
            in <code className="text-sage">frontend/.env</code> to select the VidRift iframe provider.
          </p>
        )}
      </div>

      {!user && (
        <p className="mt-3 text-center text-xs text-muted">
          <Link to="/signin" className="text-sage hover:underline">Sign in</Link>
          {" "}to save your episode progress across devices.
        </p>
      )}

      {/* Episode list */}
      {anime?.episodes && anime.episodes > 1 && (
        <div className="mt-8">
          <h2 className="mb-3 font-serif text-lg text-ivory">Episodes</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: anime.episodes }, (_, i) => i + 1).map((ep) => {
              const prog = user ? progressFor(animeId, ep) : undefined;
              const isCurrent = ep === episodeNumber;
              return (
                <Link
                  key={ep}
                  to={`/watch/${animeId}/${ep}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-anteiku text-sm transition-colors
                    ${isCurrent
                      ? "bg-forest text-ivory"
                      : prog?.completed
                      ? "bg-bg-card text-sage"
                      : "border border-border-subtle text-muted hover:border-sage hover:text-ivory"
                    }`}
                >
                  {ep}
                  {prog && !prog.completed && (
                    <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-sage opacity-70" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
