import { useCallback, useEffect, useRef, useState } from "react";
import { VIDRIFT_ORIGIN, vidriftAnilistUrl } from "./providers/VidRiftProvider";

export interface VidRiftProgress {
  currentTime: number;
  duration: number;
  anilistId: number | null;
  anilistEpisode: number | null;
}

export interface VidRiftPlayerProps {
  anilistId: number;
  episode: number;
  dub?: boolean;
  resumeSeconds?: number;
  resumeReady?: boolean;
  title?: string;
  onProgress?: (progress: VidRiftProgress) => void;
  onPause?: (currentTime: number) => void;
  onStarted?: () => void;
  onEnded?: () => void;
  onExit?: () => void;
  onReady?: () => void;
}

function isMessageData(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

// Do not add a sandbox attribute: VidRift documents that sandboxed embeds
// cannot play. All incoming messages are checked against both origin and source.
export default function VidRiftPlayer({
  anilistId,
  episode,
  dub = false,
  resumeSeconds = 0,
  resumeReady = true,
  title,
  onProgress,
  onPause,
  onStarted,
  onEnded,
  onExit,
  onReady,
}: VidRiftPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const latestCallbacks = useRef({ onProgress, onPause, onStarted, onEnded, onExit, onReady });
  const resumeSent = useRef(false);
  const playbackStarted = useRef(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  latestCallbacks.current = { onProgress, onPause, onStarted, onEnded, onExit, onReady };

  const src = vidriftAnilistUrl(anilistId, episode, { dub, title });

  const send = useCallback((message: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(message, VIDRIFT_ORIGIN);
  }, []);

  // Ask for state after each new iframe load. Resume is a documented command
  // and is sent only once, including when saved progress arrives after load.
  useEffect(() => {
    if (iframeLoaded) send({ type: "vidrift:get-state" });
  }, [iframeLoaded, send]);

  useEffect(() => {
    if (!iframeLoaded || !resumeReady || resumeSent.current) return;
    if (!playbackStarted.current && resumeSeconds > 0) {
      send({ type: "vidrift:resume", currentTime: Math.floor(resumeSeconds) });
    }
    // Mark the initial restoration decision even when there was no saved
    // position. Later progress writes must never seek the active player.
    resumeSent.current = true;
  }, [iframeLoaded, resumeReady, resumeSeconds, send]);

  useEffect(() => {
    function handleMessage(event: MessageEvent<unknown>) {
      if (event.origin !== VIDRIFT_ORIGIN) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isMessageData(event.data) || typeof event.data.type !== "string") return;

      const data = event.data;
      const callbacks = latestCallbacks.current;

      switch (data.type) {
        case "vidrift:progress": {
          if (!isFiniteNonNegative(data.currentTime) || !isFiniteNonNegative(data.duration)) return;
          const anilist = isMessageData(data.anilist) ? data.anilist : null;
          callbacks.onProgress?.({
            currentTime: data.currentTime,
            duration: data.duration,
            anilistId: typeof anilist?.id === "number" ? anilist.id : null,
            anilistEpisode: typeof anilist?.episode === "number" ? anilist.episode : null,
          });
          break;
        }
        case "vidrift:paused":
          if (isFiniteNonNegative(data.currentTime)) {
            callbacks.onPause?.(data.currentTime);
          }
          break;
        case "vidrift:unpaused":
          playbackStarted.current = true;
          callbacks.onStarted?.();
          break;
        case "vidrift:ended":
          callbacks.onEnded?.();
          break;
        case "vidrift:exit":
          callbacks.onExit?.();
          break;
        default:
          break;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function handleLoad() {
    setIframeLoaded(true);
    latestCallbacks.current.onReady?.();
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-anteiku bg-black">
      <iframe
        ref={iframeRef}
        key={src}
        src={src}
        title={title ? `${title} — episode ${episode}` : `Episode ${episode}`}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={handleLoad}
      />
    </div>
  );
}
