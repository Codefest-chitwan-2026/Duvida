import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

if (!env.supabaseUrl) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL environment variable");
}

if (!env.supabasePublishableKey) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable");
}

export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/** Safe read-only ping — confirms the client can reach Supabase and the `issues` table exists. */
export async function testSupabaseConnection() {
  const { data, error } = await supabase.from("issues").select("*").limit(1);
  if (error) {
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const, rowCount: data.length };
}
