// Single switch point for where dashboard data comes from.
//
// Today this always resolves to the mock provider (Supabase is intentionally
// not connected during this UI-only phase). To go live later, implement a
// `supabase-provider.ts` satisfying `DashboardDataProvider` from ./types and
// swap the export below — no component code needs to change, since every
// component consumes `DashboardData` through props, not this module directly.

import { supabaseDashboardDataProvider } from "@/lib/data/supabase-provider";
import type { DashboardDataProvider } from "@/lib/data/types";

export function getDashboardDataProvider(): DashboardDataProvider {
  return supabaseDashboardDataProvider;
}

export * from "@/lib/data/types";
