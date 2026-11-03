import { env } from "@/lib/env";
import { supabase } from "@/services/auth/supabaseClient";

// Thin fetch wrapper for the Anteiku backend. Attaches the Supabase access
// token so the backend can verify identity server-side rather than trusting
// a client-supplied user id.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
