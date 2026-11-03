// Demo playback provider — uses short sample videos for local development and
// portfolio demonstrations. These clips are not real anime episodes.

import type { PlaybackSource, EpisodeInfo } from "./PlaybackProvider";

const DEMO_CLIPS: Record<number, string> = {
  1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  2: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  3: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
};

const DEFAULT_CLIP =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const DemoProvider: PlaybackSource = {
  name: "Demo (sample video)",
  kind: "video",
  enabled: true,
  getEmbedUrl(episode: EpisodeInfo): string {
    const episodeKey = ((Math.max(1, episode.episodeNumber) - 1) % 4) + 1;
    return DEMO_CLIPS[episodeKey] ?? DEFAULT_CLIP;
  },
};
