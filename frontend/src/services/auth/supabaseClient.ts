import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Frontend Supabase client — public URL + publishable (anon) key only.
// Never import a service-role key here.
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey);
