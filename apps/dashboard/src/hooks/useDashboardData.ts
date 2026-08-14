"use client";

import { useCallback, useEffect, useState } from "react";
import { getDashboardDataProvider } from "@/lib/data";
import { getSupabaseClient } from "@/lib/supabase";
import type { DashboardData, ReportStatus } from "@/lib/data/types";

export type DashboardQueryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; data: DashboardData };

export interface DashboardQueryParams {
  wardFilter?: string;
  statusFilter?: ReportStatus | "all";
}

export function useDashboardData(params: DashboardQueryParams) {
  const [state, setState] = useState<DashboardQueryState>({ status: "loading" });
  const provider = getDashboardDataProvider();

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await provider.getDashboardData(params);
      const hasAnyData = data.summary.totalReports.value > 0 || data.recentReports.length > 0;
      setState(hasAnyData ? { status: "ready", data } : { status: "empty" });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load dashboard data." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.wardFilter, params.statusFilter]);

  useEffect(() => {
    load();
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch {
      return;
    }
    const channel = supabase
      .channel("authority-dashboard-reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [load]);

  return { state, source: provider.source, reload: load };
}
