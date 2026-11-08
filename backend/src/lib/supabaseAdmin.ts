import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

// This client must only be imported by server-side code. The service-role key
// has permission to manage Auth users and must never reach the frontend.
export const supabaseAdmin = env.supabaseUrl && env.supabaseServiceRoleKey
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
  : null;
