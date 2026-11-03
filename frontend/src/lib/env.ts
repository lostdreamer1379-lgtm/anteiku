// Central place to read Vite env vars so a missing var fails loudly and once,
// instead of silently producing undefined deep inside a service file.

function readEnv(key: string, required = true): string {
  const value = import.meta.env[key];
  if (required && !value) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing ${key} — check your .env file against .env.example`);
  }
  return value ?? "";
}

export const env = {
  supabaseUrl: readEnv("VITE_SUPABASE_URL"),
  supabasePublishableKey: readEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
  apiBaseUrl: readEnv("VITE_API_BASE_URL", false) || "http://localhost:4000/api",
  playbackProvider: readEnv("VITE_PLAYBACK_PROVIDER", false).toLowerCase() === "vidrift"
    ? "vidrift" as const
    : "demo" as const,
};
