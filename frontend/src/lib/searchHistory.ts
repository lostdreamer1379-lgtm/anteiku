const SEARCH_HISTORY_KEY = "anteiku:search-history";
const MAX_SEARCH_HISTORY = 5;

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getSearchHistory(): string[] {
  if (!canUseStorage()) return [];

  try {
    const saved = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((query): query is string => typeof query === "string" && query.trim().length > 0).slice(0, MAX_SEARCH_HISTORY);
  } catch {
    return [];
  }
}

function saveSearchHistory(history: string[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_SEARCH_HISTORY)));
}

export function addSearchToHistory(query: string) {
  const normalized = query.trim();
  if (!normalized) return getSearchHistory();

  const next = [normalized, ...getSearchHistory().filter((item) => item.toLowerCase() !== normalized.toLowerCase())];
  saveSearchHistory(next);
  return next.slice(0, MAX_SEARCH_HISTORY);
}

export function removeSearchFromHistory(query: string) {
  const next = getSearchHistory().filter((item) => item !== query);
  saveSearchHistory(next);
  return next;
}
