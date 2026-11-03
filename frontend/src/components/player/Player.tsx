import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import PlayerControls from "./PlayerControls";
import PlayerLoading from "./PlayerLoading";
import PlayerError from "./PlayerError";
import VidRiftPlayer, { type VidRiftAudioTrack, type VidRiftProgress } from "./VidRiftPlayer";
import { resolveProvider } from "./providers/PlaybackProvider";
import type { EpisodeInfo } from "./providers/PlaybackProvider";

interface PlayerProps {
  episode: EpisodeInfo;
  totalEpisodes: number;
  savedProgressSeconds?: number;
  resumeReady?: boolean;
  dub?: boolean;
  onProgressUpdate?: (seconds: number) => void;
  onEpisodeComplete?: () => void;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  onExit?: () => void;
}

const PROGRESS_SYNC_INTERVAL_MS = 10_000;

export default function Player({
  episode,
  totalEpisodes,
  savedProgressSeconds = 0,
  resumeReady = true,
  dub = false,
  onProgressUpdate,
  onEpisodeComplete,
  onPrevEpisode,
  onNextEpisode,
  onExit,
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIframeSyncAt = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [videoMetadataLoaded, setVideoMetadataLoaded] = useState(false);
  const videoResumeApplied = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [audioTracks, setAudioTracks] = useState<VidRiftAudioTrack[]>([]);
  const [selectedAudio, setSelectedAudio] = useState("");
  const [key, setKey] = useState(0);

  const provider = resolveProvider();
  const src = provider.enabled ? provider.getEmbedUrl(episode, { dub }) : null;

  const syncVideoProgress = useCallback(() => {
    const time = videoRef.current?.currentTime ?? 0;
    if (time > 0) onProgressUpdate?.(Math.floor(time));
  }, [onProgressUpdate]);

  useEffect(() => {
    if (provider.kind !== "video") return;
    syncRef.current = setInterval(syncVideoProgress, PROGRESS_SYNC_INTERVAL_MS);
    return () => {
      if (syncRef.current) clearInterval(syncRef.current);
      syncVideoProgress();
    };
  }, [provider.kind, syncVideoProgress]);

  // VidRift emits progress every five seconds. Persist at most every ten
  // seconds, while still saving immediately when the viewer pauses or exits.
  const handleIframeProgress = useCallback((progress: VidRiftProgress) => {
    setCurrentTime(progress.currentTime);
    setDuration(progress.duration);
    const now = Date.now();
    if (now - lastIframeSyncAt.current >= PROGRESS_SYNC_INTERVAL_MS) {
      lastIframeSyncAt.current = now;
      if (progress.currentTime > 0) onProgressUpdate?.(Math.floor(progress.currentTime));
    }
  }, [onProgressUpdate]);

  const handleIframePause = useCallback((seconds: number) => {
    setPlaying(false);
    setCurrentTime(seconds);
    if (seconds > 0) {
      lastIframeSyncAt.current = Date.now();
      onProgressUpdate?.(Math.floor(seconds));
    }
  }, [onProgressUpdate]);

  useEffect(() => {
    if (provider.kind !== "video" || !videoMetadataLoaded || !resumeReady || videoResumeApplied.current) return;
    const video = videoRef.current;
    if (!video) return;
    if (savedProgressSeconds > 0) {
      video.currentTime = Math.min(savedProgressSeconds, Math.max(0, video.duration - 1));
    }
    videoResumeApplied.current = true;
  }, [provider.kind, videoMetadataLoaded, resumeReady, savedProgressSeconds]);

  const handleIframeExit = useCallback(() => {
    if (currentTime > 0) onProgressUpdate?.(Math.floor(currentTime));
    onExit?.();
  }, [currentTime, onExit, onProgressUpdate]);

  function handleMetadata() {
    const video = videoRef.current;
    setDuration(video?.duration ?? 0);
    setVideoMetadataLoaded(true);
    setLoading(false);
  }

  function handleTimeUpdate() {
    setCurrentTime(videoRef.current?.currentTime ?? 0);
  }

  function handleEnded() {
    setPlaying(false);
    onEpisodeComplete?.();
  }

  function handlePlayPause() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {
        setError("The sample video could not start. Check your connection and try again.");
      });
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function handleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }

  function handleSeek(seconds: number) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(seconds, duration));
    setCurrentTime(videoRef.current.currentTime);
  }

  function handleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current.requestFullscreen?.();
    }
  }

  function handleVideoError() {
    setLoading(false);
    setError("This sample video couldn't be loaded. Check your connection and retry.");
  }

  function handleAudioTracks(tracks: VidRiftAudioTrack[], selected: string) {
    setAudioTracks(tracks);
    setSelectedAudio((current) => tracks.some((track) => track.value === current) ? current : selected);
  }

  if (!src) {
    return <PlayerError message="The selected playback provider could not build a source for this episode." />;
  }

  if (provider.kind === "iframe") {
    return (
      <div ref={containerRef} className="player-shell group relative w-full overflow-hidden rounded-anteiku bg-black [&:fullscreen]:flex [&:fullscreen]:h-screen [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen>div]:h-full [&:fullscreen>div]:w-full [&:fullscreen>div]:aspect-auto">
        {loading && <div className="absolute inset-0 z-10"><PlayerLoading /></div>}
        <button
          type="button"
          aria-label="Fullscreen"
          onClick={handleFullscreen}
          className="absolute right-3 top-3 z-20 rounded-md bg-black/60 p-2 text-white/90 shadow-lg backdrop-blur transition-colors hover:bg-black/80 hover:text-white focus-visible:outline-2 focus-visible:outline-sage"
        >
          <Maximize2 size={17} />
        </button>
        <VidRiftPlayer
          key={`${src}-${key}`}
          anilistId={episode.animeId}
          episode={episode.episodeNumber}
          dub={dub}
          resumeSeconds={savedProgressSeconds}
          resumeReady={resumeReady}
          title={episode.title}
          onProgress={handleIframeProgress}
          onPause={handleIframePause}
          onStarted={() => setPlaying(true)}
          onEnded={() => {
            setPlaying(false);
            onEpisodeComplete?.();
          }}
          onExit={handleIframeExit}
          onReady={() => setLoading(false)}
          onAudioTracks={handleAudioTracks}
          selectedAudio={selectedAudio}
        />
        {audioTracks.length > 0 && (
          <div className="flex items-center gap-2 border-t border-white/10 bg-black/80 px-3 py-2 text-xs text-white backdrop-blur">
            <span className="text-white/60">Audio language</span>
            <select
              value={selectedAudio}
              onChange={(event) => setSelectedAudio(event.target.value)}
              aria-label="Audio language"
              className="min-w-0 rounded border border-white/20 bg-black/70 px-2 py-1 text-xs text-white outline-none focus:border-sage"
            >
              {audioTracks.map((track) => <option key={track.value} value={track.value}>{track.label}</option>)}
            </select>
          </div>
        )}
        <div className="sr-only" aria-live="polite">
          {playing ? "Playing" : "Paused"} — episode {episode.episodeNumber}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-anteiku bg-black"
    >
      {loading && <PlayerLoading />}
      {error && <PlayerError message={error} onRetry={() => {
        setError(null);
        setLoading(true);
        setKey((value) => value + 1);
      }} />}

      {!error && (
        <video
          key={key}
          ref={videoRef}
          src={src}
          className="h-full w-full object-contain"
          onLoadedMetadata={handleMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleVideoError}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          aria-label={`Episode ${episode.episodeNumber}${episode.title ? ` — ${episode.title}` : ""}`}
          playsInline
        />
      )}

      {!error && !loading && (
        <PlayerControls
          playing={playing}
          muted={muted}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onMute={handleMute}
          onSeek={handleSeek}
          onFullscreen={handleFullscreen}
          onPrevEpisode={onPrevEpisode}
          onNextEpisode={onNextEpisode}
          hasPrev={episode.episodeNumber > 1}
          hasNext={episode.episodeNumber < totalEpisodes}
        />
      )}

      <div className="sr-only" aria-live="polite">
        {playing ? "Playing" : "Paused"} — episode {episode.episodeNumber}
      </div>
    </div>
  );
}
