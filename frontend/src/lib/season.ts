export type Season = "WINTER" | "SPRING" | "SUMMER" | "FALL";

// AniList's own season boundaries (by month, 1-indexed).
export function getCurrentSeason(date = new Date()): { season: Season; year: number } {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (month <= 3) return { season: "WINTER", year };
  if (month <= 6) return { season: "SPRING", year };
  if (month <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

export function shiftSeason(season: Season, year: number, delta: 1 | -1): { season: Season; year: number } {
  const order: Season[] = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const index = order.indexOf(season);
  const nextIndex = index + delta;

  if (nextIndex < 0) return { season: "FALL", year: year - 1 };
  if (nextIndex > 3) return { season: "WINTER", year: year + 1 };
  return { season: order[nextIndex], year };
}

export const SEASON_LABELS: Record<Season, string> = {
  WINTER: "Winter",
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
};

export function formatTimeUntilAiring(seconds: number): string {
  if (seconds <= 0) return "Airing now";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
