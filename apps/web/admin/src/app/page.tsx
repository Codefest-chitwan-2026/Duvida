"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Leaf, 
  MapPin, 
  ArrowUpRight, 
  Users, 
  Activity, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Droplets,
  Zap,
  Trash2,
  Car
} from "lucide-react";
import { 
  MOCK_REPORTS, 
  CATEGORY_DETAILS, 
  SEVERITY_DETAILS, 
  STATUS_DETAILS, 
  type ReportSummary, 
  type ReportStatus 
} from "@duvidha/shared";

export default function DashboardOverview() {
  const [reports, setReports] = useState<ReportSummary[]>(MOCK_REPORTS);

  const handleQuickStatusChange = (id: string, newStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r))
    );
  };

  const totalReports = reports.length;
  const criticalCount = reports.filter((r) => r.severity === "high").length;
  const inProgressCount = reports.filter((r) => ["assigned", "in_progress"].includes(r.status)).length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="flex-between" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="page-title">Digital Twin Command Center</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Real-time urban infrastructure telemetry, citizen report triage, and environmental impact.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/map" className="btn btn-secondary">
            <MapPin size={16} />
            <span>Open Spatial Map</span>
          </Link>
          <Link href="/reports" className="btn btn-primary">
            <span>Review Full Queue</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="icon-wrap" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <Activity size={22} />
          </div>
          <div className="metric-value">{totalReports}</div>
          <div className="metric-label">Total Active Incidents</div>
          <div className="metric-change" style={{ color: "var(--success)" }}>
            <Sparkles size={13} />
            <span>+4 reported today</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="icon-wrap" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>
            <ShieldAlert size={22} />
          </div>
          <div className="metric-value" style={{ color: "#f87171" }}>{criticalCount}</div>
          <div className="metric-label">High Priority Hazards</div>
          <div className="metric-change" style={{ color: "#f87171" }}>
            <span>Needs immediate dispatch</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="icon-wrap" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
            <Clock size={22} />
          </div>
          <div className="metric-value" style={{ color: "#fbbf24" }}>{inProgressCount}</div>
          <div className="metric-label">Crew In Progress / Assigned</div>
          <div className="metric-change" style={{ color: "var(--text-muted)" }}>
            <span>Avg. resolution ~4.2h</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="icon-wrap" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-value" style={{ color: "#34d399" }}>{resolvedCount}</div>
          <div className="metric-label">Resolved & Closed</div>
          <div className="metric-change" style={{ color: "var(--success)" }}>
            <span>100% verified proof</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="icon-wrap" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <Leaf size={22} />
          </div>
          <div className="metric-value" style={{ color: "#10b981" }}>65.7 kg</div>
          <div className="metric-label">CO₂ Footprint Mitigated</div>
          <div className="metric-change" style={{ color: "var(--success)" }}>
            <span>+18.5 kg this week</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "24px" }}>
        {/* Left Column: Live Incident Triage Queue */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Live Incident Triage Stream</h2>
              <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "999px", backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", fontWeight: "600" }}>
                Realtime updates
              </span>
            </div>
            <Link href="/reports" style={{ fontSize: "0.825rem", color: "var(--primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reports.slice(0, 4).map((report) => {
              const cat = CATEGORY_DETAILS[report.category];
              const sev = SEVERITY_DETAILS[report.severity];
              const st = STATUS_DETAILS[report.status];

              return (
                <div
                  key={report.id}
                  style={{
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div className="flex-between">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        className="badge"
                        style={{ backgroundColor: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}
                      >
                        {cat.label}
                      </span>
                      <span
                        className="badge"
                        style={{ backgroundColor: sev.bgColor, color: sev.color, border: `1px solid ${sev.borderColor}` }}
                      >
                        {sev.label}
                      </span>
                    </div>
                    <span
                      className="badge"
                      style={{ backgroundColor: st.bgColor, color: st.color }}
                    >
                      {st.label}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: "500", lineHeight: "1.4" }}>
                    {report.description}
                  </p>

                  <div className="flex-between" style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      <span>{report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>By: <strong style={{ color: "var(--text-secondary)" }}>{report.reporterName}</strong></span>
                      {report.confirmationsCount && (
                        <span style={{ color: "var(--warning)", fontWeight: "600" }}>
                          ★ {report.confirmationsCount} confirmations
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Authority Fast Action Bar */}
                  <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {report.status === "submitted" && (
                      <button
                        onClick={() => handleQuickStatusChange(report.id, "verified")}
                        className="btn btn-secondary btn-sm"
                        style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Verify Report</span>
                      </button>
                    )}
                    {report.status === "verified" && (
                      <button
                        onClick={() => handleQuickStatusChange(report.id, "in_progress")}
                        className="btn btn-secondary btn-sm"
                        style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}
                      >
                        <Clock size={14} />
                        <span>Dispatch Crew</span>
                      </button>
                    )}
                    {report.status === "in_progress" && (
                      <button
                        onClick={() => handleQuickStatusChange(report.id, "resolved")}
                        className="btn btn-secondary btn-sm"
                        style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                    <Link
                      href="/reports"
                      className="btn btn-secondary btn-sm"
                      style={{ marginLeft: "auto" }}
                    >
                      <span>Full Details</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Category Breakdown & Digital Twin Health */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Spatial Distribution Card */}
          <div className="card">
            <h2 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "14px" }}>
              Incident Categories
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "Pothole & Roads", count: 2, percent: 33, color: "#ef4444" },
                { name: "Water Leaks", count: 1, percent: 17, color: "#06b6d4" },
                { name: "Garbage & Waste", count: 1, percent: 17, color: "#f59e0b" },
                { name: "Streetlights", count: 1, percent: 17, color: "#8b5cf6" },
                { name: "Environmental Cleanups", count: 1, percent: 17, color: "#10b981" },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex-between" style={{ fontSize: "0.82rem", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>{item.name}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{item.count}</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${item.percent}%`, height: "100%", backgroundColor: item.color, borderRadius: "999px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Community Engagement */}
          <div className="card" style={{ backgroundColor: "rgba(30, 41, 59, 0.4)" }}>
            <div className="flex-between" style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} color="var(--primary)" />
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Citizen Gamification</h3>
              </div>
              <Link href="/quests" style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: "600" }}>
                Quests →
              </Link>
            </div>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Citizens are actively completing community verification and cleanup quests for digital green XP & badges.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ padding: "10px", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#60a5fa" }}>89 / 100</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Zero Plastic Quests</div>
              </div>
              <div style={{ padding: "10px", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#34d399" }}>14,500</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Points Awarded</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
