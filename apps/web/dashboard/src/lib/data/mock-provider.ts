// Development-only mock data. Replace with Supabase data before production.

import { MOCK_DASHBOARD_DATA } from "@/data/mock-dashboard-data";
import type { DashboardData, DashboardDataProvider } from "@/lib/data/types";

const SIMULATED_LATENCY_MS = 350;

function applyFilters(
  data: DashboardData,
  params?: { wardFilter?: string; statusFilter?: string }
): DashboardData {
  if (!params) return data;

  let recentReports = data.recentReports;
  if (params.wardFilter && params.wardFilter !== "all") {
    recentReports = recentReports.filter((r) => r.ward === params.wardFilter);
  }
  if (params.statusFilter && params.statusFilter !== "all") {
    recentReports = recentReports.filter((r) => r.status === params.statusFilter);
  }

  return { ...data, recentReports };
}

export const mockDashboardDataProvider: DashboardDataProvider = {
  source: "mock",
  async getDashboardData(params) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
    return applyFilters(MOCK_DASHBOARD_DATA, params);
  },
};
