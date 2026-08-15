"use client";

import { useState } from "react";
import { AlertTriangle, Clock, Droplets, Leaf, MapPin, Tag, Trash2, Users2, Zap } from "lucide-react";
import type { ReportStatus, RecentReport, SeverityLevel } from "@/lib/data/types";
import { InlineUnavailable } from "@/components/DashboardStates";

const CATEGORY_ICON: Record<string, typeof Trash2> = {
  "Waste & Recycling": Trash2,
  "Water Supply": Droplets,
  "Streetlight & Energy": Zap,
  "Road & Infrastructure": AlertTriangle,
  "Greenery & Biodiversity": Leaf,
  "Community Action": Users2,
};

const STATUS_STYLE: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  submitted: { label: "Submitted", color: "var(--stone)", bg: "var(--stone-light)" },
  pending_review: { label: "Pending Review", color: "var(--honey)", bg: "var(--honey-light)" },
  verified: { label: "Verified", color: "var(--sage)", bg: "var(--sage-light)" },
  assigned: { label: "Assigned", color: "var(--denim)", bg: "var(--denim-light)" },
  in_progress: { label: "In Progress", color: "var(--denim)", bg: "var(--denim-light)" },
  resolved: { label: "Resolved", color: "var(--plum)", bg: "var(--plum-light)" },
  rejected: { label: "Rejected", color: "var(--clay)", bg: "var(--clay-light)" },
};

// Left-edge accent color, coded by report severity so priority is
// scannable at a glance across the card grid.
const SEVERITY_ACCENT: Record<SeverityLevel, string> = {
  high: "var(--clay)",
  medium: "var(--honey)",
  low: "var(--sage)",
};

type SortOrder = "newest" | "oldest";

export function RecentReports({ reports }: { reports: RecentReport[] }) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const sortedReports = sortOrder === "newest" ? reports : [...reports].reverse();

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", gap: "12px" }}>
        <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--text-primary)" }}>Reported Issues</h2>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="input-control"
          aria-label="Sort reports"
          style={{ height: "34px", padding: "0 10px", fontSize: "0.78rem", width: "auto" }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {sortedReports.length === 0 ? (
        <InlineUnavailable message="No reports match the current filters." />
      ) : (
        <div className="report-list">
          {sortedReports.map((report) => {
            const Icon = CATEGORY_ICON[report.category] ?? AlertTriangle;
            const status = STATUS_STYLE[report.status];

            return (
              <div key={report.id} className="report-card" style={{ borderLeft: `8px solid ${SEVERITY_ACCENT[report.severity]}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="report-card-thumb">
                    {report.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={report.imageUrl} alt={report.title} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                      <p className="report-card-title">{report.title}</p>
                      <span className="badge" style={{ backgroundColor: status.bg, color: status.color, flexShrink: 0 }}>
                        {status.label}
                      </span>
                    </div>
                    <p className="report-card-desc">{report.description}</p>
                  </div>
                </div>

                <div className="report-card-meta">
                  <span>
                    <MapPin size={12} />
                    {report.location}
                  </span>
                  <span>
                    <Clock size={12} />
                    {report.reportedAgo}
                  </span>
                  <span>
                    <Tag size={12} />
                    {report.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
