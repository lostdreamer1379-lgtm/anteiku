import { env } from "@/lib/env";

export interface ComixMangaSearchResult {
  id: string;
  title: string;
  img?: string;
  cover?: string;
  type?: string;
  status?: string | number;
  score?: number;
}

export interface ComixManga extends ComixMangaSearchResult {
  synopsis?: string;
  authors?: string;
  artists?: string;
  genres?: string[];
  chapters?: ComixChapter[];
}

export interface ComixChapter {
  id: string;
  title: string;
  number?: string;
  updatedAt?: string;
}

export interface ComixChapterImage {
  url: string;
  width?: number;
  height?: number;
}

interface SearchResponse {
  results?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
}

const comixApiOrigin = new URL(env.comixApiBaseUrl).origin;

function getImageValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!value || typeof value !== "object") return undefined;

  const image = value as Record<string, unknown>;
  for (const key of ["url", "src", "large", "medium", "small"]) {
    if (typeof image[key] === "string" && image[key].trim()) return image[key].trim();
  }
  return undefined;
}

function resolveImageUrl(value: unknown) {
  const rawValue = getImageValue(value);
  if (!rawValue) return "";
  try {
    const parsed = new URL(rawValue, `${comixApiOrigin}/`);

    // Keep Comix's own image proxy URLs intact. Direct CDN URLs are routed
    // through that proxy so the browser does not have to handle remote
    // redirects, hotlink restrictions, or image host CORS policies.
    if (parsed.origin !== comixApiOrigin && /^https?:$/i.test(parsed.protocol)) {
      const proxy = new URL("/api/image", comixApiOrigin);
      proxy.searchParams.set("url", parsed.toString());
      return proxy.toString();
    }

    return parsed.toString();
  } catch {
    return rawValue;
  }
}

function resolveApiUrl(path: string) {
  return new URL(path, `${env.comixApiBaseUrl}/`).toString();
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(resolveApiUrl(path));
  if (!response.ok) throw new Error(`Comix request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

async function getJsonWithFallback<T>(primaryPath: string, fallbackPath: string): Promise<T> {
  try {
    return await getJson<T>(primaryPath);
  } catch (primaryError) {
    try {
      return await getJson<T>(fallbackPath);
    } catch {
      throw primaryError;
    }
  }
}

function normalizeManga(item: Record<string, unknown>): ComixManga {
  return {
    id: String(item.id ?? item.slug ?? ""),
    title: String(item.title ?? item.name ?? "Untitled manga"),
    img: resolveImageUrl(item.img ?? item.cover),
    type: typeof item.type === "string" ? item.type : undefined,
    status: typeof item.status === "string" || typeof item.status === "number" ? item.status : undefined,
    score: typeof item.score === "number" ? item.score : undefined,
    synopsis: typeof item.synopsis === "string" ? item.synopsis : undefined,
    authors: typeof item.authors === "string" ? item.authors : undefined,
    artists: typeof item.artists === "string" ? item.artists : undefined,
    genres: Array.isArray(item.genres) ? item.genres.filter((genre): genre is string => typeof genre === "string") : undefined,
  };
}

function normalizeChapter(item: Record<string, unknown>): ComixChapter | null {
  const id = item.id ?? item.chapter_id ?? item.chapterId;
  if (id === undefined || id === null) return null;
  const number = item.number ?? item.chapter ?? item.chapter_number;
  return {
    id: String(id),
    number: number === undefined || number === null ? undefined : String(number),
    title: String(item.title ?? item.name ?? (number ? `Chapter ${number}` : "Chapter")),
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
}

export async function searchComixManga(title: string): Promise<ComixMangaSearchResult[]> {
  const url = new URL(`${env.comixApiBaseUrl}/manga/search`);
  url.searchParams.set("q", title);
  url.searchParams.set("sfw", "true");
  url.searchParams.set("limit", "6");

  const response = await fetch(url);
  if (!response.ok) {
    const fallbackUrl = new URL(`${env.comixApiBaseUrl}/manga/search`);
    fallbackUrl.searchParams.set("q", title);
    fallbackUrl.searchParams.set("limit", "6");
    const fallbackResponse = await fetch(fallbackUrl);
    if (!fallbackResponse.ok) throw new Error(`Comix search failed: ${fallbackResponse.status}`);
    const fallbackPayload = await fallbackResponse.json() as SearchResponse;
    return (fallbackPayload.results ?? fallbackPayload.data ?? []).map(normalizeSearchResult);
  }

  const payload = await response.json() as SearchResponse;
  return (payload.results ?? payload.data ?? []).map(normalizeSearchResult);
}

function normalizeSearchResult(item: Record<string, unknown>): ComixMangaSearchResult {
  return {
    id: String(item.id ?? item.slug ?? ""),
    title: String(item.title ?? item.name ?? "Untitled manga"),
    img: resolveImageUrl(item.img ?? item.cover),
    type: typeof item.type === "string" ? item.type : undefined,
    status: typeof item.status === "string" || typeof item.status === "number" ? item.status : undefined,
    score: typeof item.score === "number" ? item.score : undefined,
  };
}

export async function getComixHome(): Promise<{ popular: ComixManga[]; latest: ComixManga[] }> {
  const payload = await getJsonWithFallback<{
    popular?: Record<string, unknown>[];
    latest?: Record<string, unknown>[];
    data?: { popular?: Record<string, unknown>[]; latest?: Record<string, unknown>[] };
  }>("manga/home?sfw=true", "manga/home");
  const home = payload.data ?? payload;
  return {
    popular: (home.popular ?? []).map(normalizeManga),
    latest: (home.latest ?? []).map(normalizeManga),
  };
}

export async function getComixManga(id: string): Promise<ComixManga> {
  const payload = await getJson<{ comic?: Record<string, unknown> }>(`manga/${encodeURIComponent(id)}?sfw=true`);
  return normalizeManga(payload.comic ?? {});
}

export async function getComixChapters(id: string): Promise<ComixChapter[]> {
  const payload = await getJson<{ chapters?: Record<string, unknown>[]; results?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>(
    `manga/${encodeURIComponent(id)}/chapters?page=1&limit=100`,
  );
  return (payload.chapters ?? payload.results ?? payload.data ?? [])
    .map(normalizeChapter)
    .filter((chapter): chapter is ComixChapter => chapter !== null);
}

export async function getComixChapterImages(chapterId: string): Promise<ComixChapterImage[]> {
  const payload = await getJson<{ images?: { url?: string; width?: number; height?: number }[] }>(
    `manga/read?chapterId=${encodeURIComponent(chapterId)}`,
  );
  return (payload.images ?? [])
    .filter((image) => Boolean(getImageValue(image.url)))
    .map((image) => ({
      url: resolveImageUrl(image.url),
      width: image.width,
      height: image.height,
    }));
}
