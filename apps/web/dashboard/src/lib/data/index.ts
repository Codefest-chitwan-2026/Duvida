// Single switch point for where dashboard data comes from.
//
// Today this always resolves to the mock provider (Supabase is intentionally
// not connected during this UI-only phase). To go live later, implement a
// `supabase-provider.ts` satisfying `DashboardDataProvider` from ./types and
// swap the export below — no component code needs to change, since every
// component consumes `DashboardData` through props, not this module directly.

import { mockDashboardDataProvider } from "@/lib/data/mock-provider";
import { mockQuestVerificationProvider } from "@/lib/data/quests-provider";
import type { DashboardDataProvider } from "@/lib/data/types";
import type { QuestVerificationProvider } from "@/lib/data/quests-types";

export function getDashboardDataProvider(): DashboardDataProvider {
  return mockDashboardDataProvider;
}

// Same seam as getDashboardDataProvider(): swap in a Supabase-backed
// implementation of QuestVerificationProvider here once the backend is
// ready — see the query contract at the top of quests-provider.ts.
export function getQuestVerificationProvider(): QuestVerificationProvider {
  return mockQuestVerificationProvider;
}

export * from "@/lib/data/types";
export * from "@/lib/data/quests-types";
