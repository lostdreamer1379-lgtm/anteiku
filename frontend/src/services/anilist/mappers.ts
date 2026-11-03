import type { AnimeDetails, AnimeSummary } from "@/types/anime";

// Maps raw AniList `Media` objects into the app's internal AnimeSummary/Details
// shapes so the rest of the app never touches AniList's response format directly.
export function mapMediaSummary(media: any): AnimeSummary {
  return {
    id: media.id,
    title: {
      romaji: media.title?.romaji ?? "",
      english: media.title?.english ?? null,
      native: media.title?.native ?? null,
    },
    coverImage: media.coverImage?.large ?? "",
    bannerImage: media.bannerImage ?? null,
    averageScore: media.averageScore ?? null,
    format: media.format ?? null,
    year: media.seasonYear ?? null,
    genres: media.genres ?? [],
    nextAiringEpisode: media.nextAiringEpisode
      ? {
          episode: media.nextAiringEpisode.episode,
          airingAt: media.nextAiringEpisode.airingAt,
          timeUntilAiring: media.nextAiringEpisode.timeUntilAiring,
        }
      : null,
  };
}

export function mapMediaDetails(media: any): AnimeDetails {
  return {
    ...mapMediaSummary(media),
    description: media.description ?? null,
    episodes: media.episodes ?? null,
    status: media.status ?? null,
    studios: (media.studios?.nodes ?? []).map((s: any) => s.name),
    popularity: media.popularity ?? null,
    related: (media.relations?.edges ?? []).map((e: any) => mapMediaSummary(e.node)),
    recommendations: (media.recommendations?.nodes ?? [])
      .map((n: any) => n.mediaRecommendation)
      .filter(Boolean)
      .map(mapMediaSummary),
  };
}
