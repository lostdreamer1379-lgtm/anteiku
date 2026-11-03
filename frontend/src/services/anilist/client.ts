// Minimal GraphQL client for the AniList public API.
// All AniList query strings live in this folder, not scattered in components.

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

export class AniListError extends Error {}

export async function anilistRequest<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (!response.ok || json.errors) {
    const message = json.errors?.[0]?.message ?? `AniList request failed (${response.status})`;
    throw new AniListError(message);
  }

  return json.data as T;
}
