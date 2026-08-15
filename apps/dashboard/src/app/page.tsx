"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { LoadingState, EmptyState, ErrorState } from "@/components/DashboardStates";
import { TopFilters } from "@/components/TopFilters";
import { StatCards } from "@/components/StatCards";
import { CategoryDonut } from "@/components/CategoryDonut";
import { ReportsTrendChart } from "@/components/ReportsTrendChart";
import { RecentReports } from "@/components/RecentReports";
import { TopReporters } from "@/components/TopReporters";
import { StatusDonut } from "@/components/StatusDonut";
import { RecentActivities } from "@/components/RecentActivities";
import { TodaySummary } from "@/components/TodaySummary";
import { ImpactSummary } from "@/components/ImpactSummary";
import type { ReportStatus } from "@/lib/data/types";

function exportReportsAsCsv(reports: { id: string; title: string; category: string; ward: string; severity: string; reportedAgo: string }[]) {
  const header = ["ID", "Title", "Category", "Ward", "Severity", "Reported"];
  const rows = reports.map((r) => [r.id, r.title, r.category, r.ward, r.severity, r.reportedAgo]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "municipal-dashboard-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function DashboardOverviewPage() {
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");

  const { state, source, reload } = useDashboardData({ wardFilter, statusFilter });

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={reload} />;
  if (state.status === "empty") return <EmptyState />;

  const data = state.data;

  return (
    <div className="page-container">
      <div className="flex-between" style={{ marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 className="page-title">Dashboard Overview</h1>
          </div>
          <p className="page-subtitle">Review citizen reports and verified sustainability impact across your municipality.</p>
        </div>

        <TopFilters
          filters={data.filters}
          selectedWard={wardFilter}
          onWardChange={setWardFilter}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          onExport={() => exportReportsAsCsv(data.recentReports)}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <StatCards summary={data.summary} />
      </div>

      <div id="analytics-section" className="dashboard-analytics-grid">
        <CategoryDonut items={data.categoryBreakdown} />
        <ReportsTrendChart trend={data.reportsTrend} />
      </div>

      <div id="recent-reports" style={{ marginBottom: "20px" }}>
        <RecentReports reports={data.recentReports} />
      </div>

      <div className="dashboard-grid-3col">
        <div id="top-reporters">
          <TopReporters reporters={data.topReporters} />
        </div>
        <div id="status-breakdown">
          <StatusDonut items={data.statusBreakdown} selectedStatus={statusFilter} onStatusChange={setStatusFilter} />
        </div>
      </div>

      <div className="dashboard-grid-3col" style={{ marginBottom: 0 }}>
        <div id="recent-activities">
          <RecentActivities activities={data.recentActivities} />
        </div>
        <TodaySummary metrics={data.todaySummary} />
        <div id="impact-summary">
          <ImpactSummary metrics={data.impactSummary} />
        </div>
      </div>
    </div>
  );
}
