"use client";

import { CalendarDays, Download } from "lucide-react";
import type { DashboardFilters, ReportStatus } from "@/lib/data/types";

const DATE_RANGE_LABEL = "May 18 – May 24, 2026";

export function TopFilters({
  filters,
  selectedWard,
  onWardChange,
  selectedStatus,
  onStatusChange,
  onExport,
}: {
  filters: DashboardFilters;
  selectedWard: string;
  onWardChange: (ward: string) => void;
  selectedStatus: ReportStatus | "all";
  onStatusChange: (status: ReportStatus | "all") => void;
  onExport: () => void;
}) {
  const hasWards = filters.wards.length > 0;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
      <button className="input-control" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-surface)" }} type="button">
        <CalendarDays size={15} color="var(--text-muted)" />
        <span>{DATE_RANGE_LABEL}</span>
      </button>

      {hasWards ? (
        <select
          value={selectedWard}
          onChange={(e) => onWardChange(e.target.value)}
          className="input-control"
          aria-label="Filter by ward"
        >
          <option value="all">All Wards</option>
          {filters.wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <select className="input-control" disabled aria-label="Ward filter unavailable">
            <option>Ward data unavailable</option>
          </select>
        </div>
      )}

      {filters.statuses.length > 0 && (
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as ReportStatus | "all")}
          className="input-control"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          {filters.statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}

      <button onClick={onExport} className="btn btn-primary" type="button">
        <Download size={15} />
        <span>Export Report</span>
      </button>
    </div>
  );
}
