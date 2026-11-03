import { anilistRequest } from "./client";
import {
  TRENDING_ANIME_QUERY,
  SEARCH_ANIME_QUERY,
  ANIME_DETAILS_QUERY,
  SEASONAL_ANIME_QUERY,
} from "./queries";
import { mapMediaSummary, mapMediaDetails } from "./mappers";
import type { AnimeDetails, AnimeSummary } from "@/types/anime";

export async function getTrendingAnime(perPage = 12): Promise<AnimeSummary[]> {
  const data = await anilistRequest<{ Page: { media: any[] } }>(TRENDING_ANIME_QUERY, {
    page: 1,
    perPage,
  });
  return data.Page.media.map(mapMediaSummary);
}

export interface SearchAnimeParams {
  search?: string;
  genre?: string[];
  season?: "WINTER" | "SPRING" | "SUMMER" | "FALL";
  seasonYear?: number;
  format?: string;
  status?: "RELEASING" | "FINISHED" | "NOT_YET_RELEASED" | "CANCELLED";
  sort?: string[];
  page?: number;
  perPage?: number;
}

export async function searchAnime(
  params: SearchAnimeParams
): Promise<{ results: AnimeSummary[]; hasNextPage: boolean; total: number }> {
  const data = await anilistRequest<{
    Page: { pageInfo: { hasNextPage: boolean; total: number }; media: any[] };
  }>(SEARCH_ANIME_QUERY, {
    page: params.page ?? 1,
    perPage: params.perPage ?? 24,
    search: params.search,
    genre: params.genre,
    season: params.season,
    seasonYear: params.seasonYear,
    format: params.format,
    status: params.status,
    sort: params.sort ?? ["POPULARITY_DESC"],
  });
  return {
    results: data.Page.media.map(mapMediaSummary),
    hasNextPage: data.Page.pageInfo.hasNextPage,
    total: data.Page.pageInfo.total,
  };
}

export interface SeasonalAnimeParams {
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL";
  seasonYear: number;
  page?: number;
  perPage?: number;
}

export async function getSeasonalAnime(
  params: SeasonalAnimeParams
): Promise<{ results: AnimeSummary[]; hasNextPage: boolean; total: number }> {
  const data = await anilistRequest<{
    Page: { pageInfo: { hasNextPage: boolean; total: number }; media: any[] };
  }>(SEASONAL_ANIME_QUERY, {
    season: params.season,
    seasonYear: params.seasonYear,
    page: params.page ?? 1,
    perPage: params.perPage ?? 24,
  });
  return {
    results: data.Page.media.map(mapMediaSummary),
    hasNextPage: data.Page.pageInfo.hasNextPage,
    total: data.Page.pageInfo.total,
  };
}

export async function getAnimeDetails(id: number): Promise<AnimeDetails> {
  const data = await anilistRequest<{ Media: any }>(ANIME_DETAILS_QUERY, { id });
  return mapMediaDetails(data.Media);
}
