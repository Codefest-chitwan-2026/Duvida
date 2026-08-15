import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabasePublishableKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable");
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

/** Safe read-only ping — confirms the client can reach Supabase and the `issues` table exists. */
export async function testSupabaseConnection() {
  const { data, error } = await supabase.from("issues").select("*").limit(1);
  if (error) {
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const, rowCount: data.length };
}
