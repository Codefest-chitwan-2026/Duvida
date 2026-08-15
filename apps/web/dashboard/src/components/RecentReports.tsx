import { AlertTriangle, Droplets, Leaf, Trash2, Users2, Zap } from "lucide-react";
import type { RecentReport, SeverityLevel } from "@/lib/data/types";
import { InlineUnavailable } from "@/components/DashboardStates";

const CATEGORY_ICON: Record<string, typeof Trash2> = {
  "Waste & Recycling": Trash2,
  "Water Supply": Droplets,
  "Streetlight & Energy": Zap,
  "Road & Infrastructure": AlertTriangle,
  "Greenery & Biodiversity": Leaf,
  "Community Action": Users2,
};

const SEVERITY_STYLE: Record<SeverityLevel, { label: string; color: string; bg: string }> = {
  high: { label: "High", color: "var(--red)", bg: "var(--red-light)" },
  medium: { label: "Medium", color: "var(--amber)", bg: "var(--amber-light)" },
  low: { label: "Low", color: "var(--gov-green)", bg: "var(--gov-green-light)" },
};

export function RecentReports({ reports }: { reports: RecentReport[] }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--text-primary)" }}>Recent Reports</h2>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>View All</span>
      </div>

      {reports.length === 0 ? (
        <InlineUnavailable message="No reports match the current filters." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reports.map((report) => {
            const Icon = CATEGORY_ICON[report.category] ?? AlertTriangle;
            const sev = SEVERITY_STYLE[report.severity];

            return (
              <div key={report.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-surface-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {report.title}
                  </p>
                  <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{report.location}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "4px" }}>{report.reportedAgo}</p>
                  <span className="badge" style={{ backgroundColor: sev.bg, color: sev.color }}>
                    {sev.label}
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
