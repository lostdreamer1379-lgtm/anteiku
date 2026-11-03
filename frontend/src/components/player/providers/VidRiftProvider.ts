// VidRift iframe adapter. The integration contract is documented at
// https://vidrift.net/docs. This is an iframe embed, not a direct media URL.
// VidRift currently documents a no-key AniList route. Its source catalog and
// legal availability are controlled by VidRift, not by this application.

import type { PlaybackSource, EpisodeInfo } from "./PlaybackProvider";

export const VIDRIFT_ORIGIN = "https://embed.vidrift.net";

export function vidriftAnilistUrl(
  anilistId: number,
  episode: number,
  options: { dub?: boolean; title?: string } = {},
): string {
  if (!Number.isSafeInteger(anilistId) || anilistId <= 0) {
    throw new Error("A valid AniList anime ID is required for VidRift playback.");
  }
  if (!Number.isSafeInteger(episode) || episode <= 0) {
    throw new Error("A valid episode number is required for VidRift playback.");
  }

  const url = new URL(`/embed/anilist/${anilistId}/${episode}`, VIDRIFT_ORIGIN);
  url.searchParams.set("brand", "Anteiku");
  url.searchParams.set("brandColor", "#6D9978");
  url.searchParams.set("showTitle", "1");
  url.searchParams.set("autoplay", "0");
  url.searchParams.set("exit", "1");

  // Anteiku owns episode navigation, so hide VidRift's separate episode and
  // next controls. VidRift still supplies playback, servers, subtitles, and
  // quality controls inside its own player.
  url.searchParams.set("hide", "episodes,next");

  if (options.title) url.searchParams.set("title", options.title);
  if (options.dub) url.searchParams.set("dub", "1");

  return url.toString();
}

export const VidRiftProvider: PlaybackSource = {
  name: "VidRift",
  kind: "iframe",
  enabled: true,
  getEmbedUrl(episode: EpisodeInfo, options?: { dub?: boolean }): string | null {
    if (!Number.isSafeInteger(episode.animeId) || episode.animeId <= 0) return null;
    if (!Number.isSafeInteger(episode.episodeNumber) || episode.episodeNumber <= 0) return null;
    return vidriftAnilistUrl(episode.animeId, episode.episodeNumber, {
      dub: options?.dub,
      title: episode.title,
    });
  },
};
