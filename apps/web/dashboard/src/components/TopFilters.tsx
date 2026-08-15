"use client";

import { useRef, useState } from "react";
import { CalendarDays, Download } from "lucide-react";
import type { DashboardFilters, ReportStatus } from "@/lib/data/types";

const DEFAULT_DATE = "2026-05-18";

function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

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
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "60px", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <button
          onClick={openDatePicker}
          className="input-control"
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-surface)" }}
          type="button"
        >
          <CalendarDays size={15} color="var(--text-muted)" />
          <span>{formatDate(selectedDate)}</span>
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          aria-label="Choose date"
          style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }}
        />
      </div>

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

      <button onClick={onExport} className="btn btn-primary" style={{ marginLeft: "auto" }} type="button">
        <Download size={15} />
        <span>Export Report</span>
      </button>
    </div>
  );
}
