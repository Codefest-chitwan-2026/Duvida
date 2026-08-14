import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

// Falls back to the local Supabase CLI defaults, matching the pattern already
// used by apps/admin/src/lib/supabase/client.ts.
const supabaseUrl = env.supabaseUrl || "http://127.0.0.1:54321";
const supabaseAnonKey = env.supabaseAnonKey || "mock-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
