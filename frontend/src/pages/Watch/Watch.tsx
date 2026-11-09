import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Info, Users, Link as LinkIcon, Check } from "lucide-react";
import Player from "@/components/player/Player";
import { useAnimeDetails } from "@/hooks/useAnimeDetails";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthContext";
import { resolveProvider } from "@/components/player/providers/PlaybackProvider";
import EpisodeSidebar from "@/components/watch/EpisodeSidebar";
import { useWatchParty, type WatchPartyCommand } from "@/hooks/useWatchParty";

export default function Watch() {
  const { id, episode } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const playbackProvider = resolveProvider();
  const dub = searchParams.get("dub") === "1";
  const [episodesOpen, setEpisodesOpen] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [continueParty, setContinueParty] = useState(true);
  const [partyNotice, setPartyNotice] = useState<string | null>(null);
  const [remotePartyCommand, setRemotePartyCommand] = useState<WatchPartyCommand | undefined>();

  const animeId = Number(id);
  const episodeNumber = Number(episode);
  const partyRoom = searchParams.get("party") || undefined;
  const participant = useMemo(() => user ? ({
    id: user.id,
    name: String(user.user_metadata?.username ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Viewer"),
    account: user.email ?? user.id,
    isHost: false,
  }) : undefined, [user]);
  const party = useWatchParty(animeId, episodeNumber, partyRoom, participant);
  const activePartyRoom = party.room || partyRoom;
  const partyActive = Boolean(activePartyRoom) && !party.ended;

  function navigateToEpisode(nextEpisode: number, broadcast = true) {
    if (nextEpisode < 1 || (anime?.episodes && nextEpisode > anime.episodes)) return;
    if (broadcast && partyActive) party.send({ action: "episode", episode: nextEpisode });
    const next = new URLSearchParams(searchParams);
    // A resume offset belongs to the current episode only.
    next.delete("t");
    if (partyRoom) next.set("party", partyRoom);
    else next.delete("party");
    navigate(`/watch/${animeId}/${nextEpisode}?${next.toString()}`);
  }

  function navigateToAnime(nextAnimeId: number, nextEpisode = 1, broadcast = true) {
    if (partyActive && continueParty && broadcast) {
      party.send({ action: "anime", animeId: nextAnimeId, episode: nextEpisode });
    } else if (partyActive && broadcast) {
      party.endParty();
      setPartyNotice("The watch party ended because a participant switched anime.");
    }
    const next = new URLSearchParams(searchParams);
    next.delete("t");
    if (partyActive && continueParty) next.set("party", activePartyRoom!);
    else next.delete("party");
    navigate(`/watch/${nextAnimeId}/${nextEpisode}?${next.toString()}`);
  }

  useEffect(() => party.onCommand((command) => {
    if (command.action === "anime") {
      setPartyNotice("A party member switched the group to another anime.");
      navigateToAnime(command.animeId, command.episode, false);
      return;
    }
    if (command.action === "episode") {
      navigateToEpisode(command.episode, false);
      return;
    }
    setRemotePartyCommand(command);
  }), [party]);
  useEffect(() => {
    if (party.ended) setPartyNotice("The watch party ended because a participant switched anime.");
  }, [party.ended]);
  useEffect(() => {
    if (!party.ended || !partyRoom) return;
    const next = new URLSearchParams(searchParams);
    next.delete("party");
    setSearchParams(next, { replace: true });
  }, [party.ended, partyRoom, searchParams, setSearchParams]);

  function startParty() {
    const room = party.createParty();
    const next = new URLSearchParams(searchParams);
    next.set("party", room);
    setSearchParams(next);
  }

  function endParty() {
    party.endParty();
    const next = new URLSearchParams(searchParams);
    next.delete("party");
    setSearchParams(next);
  }

  async function copyPartyLink() {
    await navigator.clipboard?.writeText(window.location.href);
    setInviteCopied(true);
    window.setTimeout(() => setInviteCopied(false), 1800);
  }

  const { data: anime } = useAnimeDetails(animeId);
  const { query: progressQuery, progressFor, upsert } = useProgress();
  const startedEpisodeRef = useRef<string | null>(null);

  const totalEpisodes = anime?.episodes ?? 99;
  const savedEntry = user ? progressFor(animeId, episodeNumber) : undefined;
  const resumeFromLink = Number(searchParams.get("t"));
  const savedProgressSeconds = Number.isFinite(resumeFromLink) && resumeFromLink >= 0
    ? Math.floor(resumeFromLink)
    : savedEntry?.progressSeconds ?? 0;

  useEffect(() => {
    const episodeKey = `${animeId}-${episodeNumber}`;
    if (progressQuery.isLoading || startedEpisodeRef.current === episodeKey) return;

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
    upsert.mutate({ animeId, episodeNumber, progressSeconds: seconds, completed: false });
  }

  function handleEpisodeComplete() {
    upsert.mutate({
      animeId,
      episodeNumber,
      progressSeconds: 0,
      completed: true,
    });
    if (episodeNumber < totalEpisodes) {
      navigateToEpisode(episodeNumber + 1);
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-anteiku border border-border-subtle bg-bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Users size={17} className={party.connected ? "text-sage" : "text-muted"} />
          <div>
            <p className="text-sm font-medium text-ivory">Watch party</p>
            <p className="text-xs text-muted">
            {partyActive ? (party.connected ? "Connected — playback is synced" : "Connecting to party…") : "Watch this episode together in real time"}
            </p>
            {partyActive && party.participants.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="People in this watch party">
                {party.participants.map((person) => (
                  <span key={person.id} title={person.account} className="rounded-full border border-border-subtle bg-bg-secondary px-2 py-0.5 text-[11px] text-muted">
                    {person.name}{person.isHost ? " · host" : ""}
                  </span>
                ))}
              </div>
            )}
            {partyActive && (
              <button
                type="button"
                aria-pressed={continueParty}
                onClick={() => setContinueParty((enabled) => !enabled)}
                className="mt-2 text-xs text-sage hover:text-ivory"
              >
                {continueParty ? "✓ Continue party when changing anime" : "Continue party is off — changing anime ends it"}
              </button>
            )}
          </div>
        </div>
        {partyActive ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={copyPartyLink} className="flex items-center gap-2 rounded-full border border-sage px-3 py-1.5 text-xs text-sage hover:bg-forest">
              {inviteCopied ? <Check size={14} /> : <LinkIcon size={14} />}
              {inviteCopied ? "Copied" : "Copy invite link"}
            </button>
            {party.isHost && (
              <button type="button" onClick={endParty} className="rounded-full border border-red-400/60 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/40">
                End party
              </button>
            )}
          </div>
        ) : (
          <button type="button" onClick={startParty} className="flex items-center gap-2 rounded-full bg-sage px-3 py-1.5 text-xs font-medium text-bg-deep hover:bg-sage/90">
            <Users size={14} /> Start a party
          </button>
        )}
      </div>

      {partyNotice && (
        <div role="status" className="mb-4 rounded-anteiku border border-sage/50 bg-forest/40 px-4 py-3 text-sm text-ivory">
          {partyNotice}
          <button type="button" onClick={() => setPartyNotice(null)} className="ml-3 text-sage hover:text-ivory">Dismiss</button>
        </div>
      )}

      <div className="mt-4 grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
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
            onPrevEpisode={episodeNumber > 1 ? () => navigateToEpisode(episodeNumber - 1) : undefined}
            onNextEpisode={episodeNumber < totalEpisodes ? () => navigateToEpisode(episodeNumber + 1) : undefined}
            onPartyEvent={partyActive ? party.send : undefined}
            remotePartyCommand={remotePartyCommand}
          />

          <div className="mt-4 flex items-start gap-2 rounded-anteiku border border-border-subtle/60 bg-bg-card px-4 py-3">
            <Info size={14} className="mt-0.5 shrink-0 text-sage" />
            {playbackProvider.kind === "iframe" ? (
              <p className="text-xs leading-relaxed text-muted"><span className="font-medium text-ivory">VidRift player active.</span>{" "}Playback is provided by a third-party iframe. Use the player’s server, audio and subtitle menus to choose an available source. Some AniList entries may not have a VidRift mapping or working source. Anteiku does not host the stream; use embeds only for content you are authorised to display. VidRift does not require a separate API key.</p>
            ) : (
              <p className="text-xs leading-relaxed text-muted"><span className="font-medium text-ivory">Demo playback active.</span>{" "}Sample videos are playing to demonstrate the player interface and progress tracking; they are not real anime episodes. Set <code className="text-sage">VITE_PLAYBACK_PROVIDER=vidrift</code> in <code className="text-sage">frontend/.env</code> to select the VidRift iframe provider.</p>
            )}
          </div>
        </div>

        {anime?.episodes && anime.episodes > 1 && (
          <EpisodeSidebar
            animeId={animeId}
            animeTitle={animeTitle}
            coverImage={anime.coverImage}
            description={anime.description}
            totalEpisodes={anime.episodes}
            currentEpisode={episodeNumber}
            isOpen={episodesOpen}
            onToggle={() => setEpisodesOpen((open) => !open)}
            progressFor={progressFor}
            isSignedIn={Boolean(user)}
          />
        )}
      </div>

      {!user && (
        <p className="mt-3 text-center text-xs text-muted">
          <Link to="/signin" className="text-sage hover:underline">Sign in</Link>
          {" "}to save your episode progress across devices.
        </p>
      )}

    </div>
  );
}
