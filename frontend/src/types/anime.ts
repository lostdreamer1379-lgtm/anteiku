// Core anime shape used throughout the app. Mapped from AniList GraphQL responses
// in services/anilist — components should never see raw AniList response shapes.

export interface AnimeTitle {
  romaji: string;
  english: string | null;
  native: string | null;
}

export interface AnimeSummary {
  id: number;
  mediaType?: string | null;
  title: AnimeTitle;
  coverImage: string;
  bannerImage: string | null;
  averageScore: number | null;
  format: string | null;
  year: number | null;
  genres: string[];
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  } | null;
}

export interface AnimeDetails extends AnimeSummary {
  description: string | null;
  episodes: number | null;
  status: string | null;
  studios: string[];
  popularity: number | null;
  related: AnimeSummary[];
  recommendations: AnimeSummary[];
}

export type WatchStatus = "WATCHING" | "COMPLETED" | "PLANNING" | "PAUSED" | "DROPPED";

export interface WatchlistEntry {
  id: string;
  animeId: number;
  status: WatchStatus;
  updatedAt: string;
}

export interface WatchProgressEntry {
  id: string;
  animeId: number;
  episodeNumber: number;
  progressSeconds: number;
  completed: boolean;
  updatedAt: string;
}
