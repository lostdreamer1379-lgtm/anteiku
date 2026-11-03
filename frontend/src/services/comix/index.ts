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
