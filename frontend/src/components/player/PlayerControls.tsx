import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";

interface PlayerControlsProps {
  playing: boolean;
  muted: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onMute: () => void;
  onSeek: (seconds: number) => void;
  onFullscreen: () => void;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function formatTime(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PlayerControls({
  playing,
  muted,
  currentTime,
  duration,
  onPlayPause,
  onMute,
  onSeek,
  onFullscreen,
  onPrevEpisode,
  onNextEpisode,
  hasPrev,
  hasNext,
}: PlayerControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-4 pt-12 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
      {/* Scrubber */}
      <div className="relative mb-3 h-1 cursor-pointer rounded-full bg-white/20" role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          onSeek(ratio * duration);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onSeek(Math.min(duration, currentTime + 10));
          if (e.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 10));
        }}
      >
        <div
          className="h-full rounded-full bg-sage transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-ivory shadow"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Buttons row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous episode"
            disabled={!hasPrev}
            onClick={onPrevEpisode}
            className="text-white/70 hover:text-white disabled:opacity-30"
          >
            <SkipBack size={18} />
          </button>

          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={onPlayPause}
            className="text-white hover:text-sage"
          >
            {playing ? <Pause size={22} /> : <Play size={22} />}
          </button>

          <button
            type="button"
            aria-label="Next episode"
            disabled={!hasNext}
            onClick={onNextEpisode}
            className="text-white/70 hover:text-white disabled:opacity-30"
          >
            <SkipForward size={18} />
          </button>

          <button
            type="button"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={onMute}
            className="text-white/70 hover:text-white"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <span className="text-xs tabular-nums text-white/60">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <button
          type="button"
          aria-label="Fullscreen"
          onClick={onFullscreen}
          className="text-white/70 hover:text-white"
        >
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
}
