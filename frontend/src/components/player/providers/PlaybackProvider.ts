// Provider-independent playback selection. Direct video sources are rendered
// with the native HTML video element; cross-origin iframe providers render
// their own player controls and communicate through a documented message API.

import { env } from "@/lib/env";
import { DemoProvider } from "./DemoProvider";
import { VidRiftProvider } from "./VidRiftProvider";

export interface EpisodeInfo {
  animeId: number;
  episodeNumber: number;
  title?: string;
}

export interface PlaybackSource {
  readonly name: string;
  readonly kind: "video" | "iframe";
  readonly enabled: boolean;
  getEmbedUrl(episode: EpisodeInfo, options?: { dub?: boolean }): string | null;
}

// Demo playback remains the safe local default. Select VidRift explicitly in
// frontend/.env with VITE_PLAYBACK_PROVIDER=vidrift when you are entitled to
// embed the title being played. VidRift itself does not issue an API key.
export function resolveProvider(): PlaybackSource {
  return env.playbackProvider === "vidrift" ? VidRiftProvider : DemoProvider;
}
