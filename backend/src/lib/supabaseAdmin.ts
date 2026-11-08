import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

// This client must only be imported by server-side code. The service-role key
// has permission to manage Auth users and must never reach the frontend.
let client: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    client = null;
    return client;
  }

  try {
    client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  } catch {
    client = null;
  }

  return client;
}
