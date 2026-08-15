import AsyncStorage from "@react-native-async-storage/async-storage";

import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";

const GUEST_ID_KEY = "duvida.guestReporterId";

async function registerGuestId(): Promise<string> {
  const response = await fetch(`${env.advisorApiUrl}/community/guest-id`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`Could not register a guest identity (${response.status})`);
  }
  const data: { reporter_id: string } = await response.json();
  return data.reporter_id;
}

/**
 * Real Supabase auth user id if signed in, otherwise a persistent guest id.
 * The guest id is minted once by the backend (issues.reporter_id has a real
 * FK to profiles, which this app has no signup flow to satisfy on its own)
 * and cached locally so the same id is reused on every later submission.
 */
export async function getReporterId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user?.id) {
    return data.session.user.id;
  }

  const cached = await AsyncStorage.getItem(GUEST_ID_KEY);
  if (cached) return cached;

  const reporterId = await registerGuestId();
  await AsyncStorage.setItem(GUEST_ID_KEY, reporterId);
  return reporterId;
}

/** Drops the cached guest id so the next call to getReporterId() registers a
 * fresh one — used when the backend reports the cached id no longer exists. */
export async function clearCachedGuestId(): Promise<void> {
  await AsyncStorage.removeItem(GUEST_ID_KEY);
}
