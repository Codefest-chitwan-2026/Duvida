"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Leaf, 
  Trash2, 
  Clock, 
  Users, 
  Award, 
  Download, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { MOCK_REPORTS, CATEGORY_DETAILS } from "@duvidha/shared";

export default function ImpactAnalyticsPage() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCSV = () => {
    const headers = "ID,Category,Severity,Status,Reporter,Address,Created_At,Resolved_At\n";
    const rows = MOCK_REPORTS.map(
      (r) =>
        `"${r.id}","${r.category}","${r.severity}","${r.status}","${r.reporterName}","${r.address || ""}","${r.createdAt}","${r.resolvedAt || ""}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `team-duvidha-impact-audit-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Municipal Environmental Impact & ESG Analytics</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Standardized CO₂ mitigation calculations, waste diversion records, and citizen participation metrics.
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-primary">
          <Download size={16} />
          <span>Export ESG Audit CSV</span>
        </button>
      </div>

      {downloadSuccess && (
        <div style={{
          padding: "12px 18px",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          borderRadius: "var(--radius-md)",
          fontSize: "0.85rem",
          fontWeight: "600",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle2 size={16} />
          <span>Audit CSV report generated and downloaded successfully!</span>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="icon-wrap" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
            <Leaf size={22} />
          </div>
          <div className="metric-value" style={{ color: "#34d399" }}>184.2 kg</div>
          <div className="metric-label">Estimated CO₂ Mitigated</div>
          <div className="metric-change" style={{ color: "var(--success)" }}>
            <TrendingUp size={13} />
            <span>+24% vs last month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="icon-wrap" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
            <Trash2 size={22} />
          </div>
          <div className="metric-value" style={{ color: "#fbbf24" }}>520 kg</div>
          <div className="metric-label">Municipal Waste Cleared</div>
          <div className="metric-change" style={{ color: "var(--text-muted)" }}>
            <span>Verified by municipal scale</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="icon-wrap" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
            <Clock size={22} />
          </div>
          <div className="metric-value" style={{ color: "#60a5fa" }}>4.2 hrs</div>
          <div className="metric-label">Mean Resolution Turnaround</div>
          <div className="metric-change" style={{ color: "var(--success)" }}>
            <span>-1.8 hrs faster response</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="icon-wrap" style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", color: "#c084fc" }}>
            <Users size={22} />
          </div>
          <div className="metric-value" style={{ color: "#c084fc" }}>142</div>
          <div className="metric-label">Active Verified Citizens</div>
          <div className="metric-change" style={{ color: "var(--success)" }}>
            <span>+38 new citizens</span>
          </div>
        </div>
      </div>

      {/* Methodology & Impact Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        {/* ESG Calculation Methodology */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "14px" }}>
            Standardized Impact Methodology
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Pothole & Traffic Flow:</strong>
              <p style={{ marginTop: "4px", fontSize: "0.825rem" }}>
                Every road hazard repaired restores average transit velocity, preventing ~12.4 kg of idling vehicle fuel emissions per verified corridor.
              </p>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Waste & Illegal Dumps:</strong>
              <p style={{ marginTop: "4px", fontSize: "0.825rem" }}>
                Rapid municipal waste collection diverts unmanaged methane release and leachate runoff into drainage channels (~1.8 kg CO₂e / kg waste).
              </p>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Solar Streetlight Auditing:</strong>
              <p style={{ marginTop: "4px", fontSize: "0.825rem" }}>
                Proactive solar lighting repairs eliminate grid dependency in public spaces, mitigating ~0.65 kWh of night grid load per fixture.
              </p>
            </div>
          </div>
        </div>

        {/* Top Active Citizen Leaders */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: "14px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
              Community Green Leaders
            </h2>
            <span style={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: "700" }}>
              Top Contributors
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { name: "Priya Patel", points: 820, reports: 12, badges: "🌟 Civic Sentinel" },
              { name: "Aarav Sharma", points: 640, reports: 9, badges: "🛠️ Road Champion" },
              { name: "Rohan Shrestha", points: 450, reports: 7, badges: "🌿 Eco Warrior" },
              { name: "Sita Gurung", points: 390, reports: 5, badges: "💧 Water Guard" },
              { name: "Bikash Thapa", points: 280, reports: 4, badges: "⚡ Solar Scout" },
            ].map((citizen, idx) => (
              <div
                key={citizen.name}
                className="flex-between"
                style={{
                  padding: "10px 14px",
                  backgroundColor: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: idx === 0 ? "#fbbf24" : idx === 1 ? "#94a3b8" : "var(--bg-surface)",
                    color: idx < 2 ? "#0f172a" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "800"
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                      {citizen.name}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {citizen.badges} • {citizen.reports} reports
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#34d399" }}>
                    {citizen.points}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                    points
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
