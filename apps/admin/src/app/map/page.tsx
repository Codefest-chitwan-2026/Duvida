"use client";

import { useState } from "react";
import { 
  MOCK_REPORTS, 
  CATEGORY_DETAILS, 
  SEVERITY_DETAILS, 
  STATUS_DETAILS, 
  type ReportSummary, 
  type ReportCategory 
} from "@duvidha/shared";
import { 
  MapPin, 
  Layers, 
  Filter, 
  AlertTriangle, 
  Navigation, 
  Compass, 
  Eye, 
  CheckCircle2,
  Info
} from "lucide-react";

export default function DigitalTwinMapPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(MOCK_REPORTS[0]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const filteredReports = MOCK_REPORTS.filter((r) =>
    selectedCategory === "all" ? true : r.category === selectedCategory
  );

  // Map center reference
  const centerLat = 12.9716;
  const centerLng = 77.5946;

  // Convert GPS coordinates to 2D SVG canvas percentages
  const getMapPosition = (lat: number, lng: number) => {
    const dLat = lat - centerLat;
    const dLng = lng - centerLng;
    // Scale for visual clarity on canvas
    const x = 50 + dLng * 2500;
    const y = 50 - dLat * 2500;
    return {
      left: `${Math.max(10, Math.min(90, x))}%`,
      top: `${Math.max(10, Math.min(90, y))}%`,
    };
  };

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 68px)", paddingBottom: "20px" }}>
      {/* Top Controls */}
      <div className="flex-between" style={{ marginBottom: "16px" }}>
        <div>
          <h1 className="page-title">Digital Twin Spatial Telemetry</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Geospatial PostGIS incident distribution, cluster density, and infrastructure status.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-control"
            style={{ width: "180px" }}
          >
            <option value="all">All Incident Layers</option>
            {Object.keys(CATEGORY_DETAILS).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_DETAILS[cat as ReportCategory].label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowHeatmap((prev) => !prev)}
            className={`btn btn-sm ${showHeatmap ? "btn-primary" : "btn-secondary"}`}
          >
            <Layers size={14} />
            <span>{showHeatmap ? "Heatmap Active" : "Toggle Heatmap"}</span>
          </button>
        </div>
      </div>

      {/* Main Map Visual Canvas + Overlay Drawer */}
      <div style={{ flex: 1, position: "relative", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", overflow: "hidden", backgroundColor: "#070b12" }}>
        {/* Synthetic Map Background (Digital Grid & Urban Roads) */}
        <svg
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0, opacity: 0.6 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
            </pattern>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Stylized Urban Arteries */}
          <path d="M 0 250 Q 300 200 600 350 T 1200 400" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
          <path d="M 200 0 Q 350 300 500 800" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
          <path d="M 700 0 Q 750 400 900 900" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
          <path d="M 0 500 Q 500 550 1200 480" fill="none" stroke="#1e293b" strokeWidth="4" opacity="0.6" />

          {/* Central Municipal Boundary Circle */}
          <circle cx="50%" cy="50%" r="220" fill="url(#glowGrad)" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.4" />
        </svg>

        {/* Heatmap Layer if Active */}
        {showHeatmap && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 52% 48%, rgba(239, 68, 68, 0.25) 0%, rgba(245, 158, 11, 0.15) 30%, transparent 60%)",
            pointerEvents: "none"
          }} />
        )}

        {/* Pins / Incident Markers */}
        {filteredReports.map((report) => {
          const isSelected = selectedReport?.id === report.id;
          const cat = CATEGORY_DETAILS[report.category];
          const sev = SEVERITY_DETAILS[report.severity];
          const pos = getMapPosition(report.latitude, report.longitude);

          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              style={{
                position: "absolute",
                left: pos.left,
                top: pos.top,
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                zIndex: isSelected ? 30 : 10,
                transition: "transform 0.2s ease",
              }}
            >
              {/* Outer Pulse */}
              {report.severity === "high" && (
                <div style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: "50%",
                  backgroundColor: "rgba(239, 68, 68, 0.4)",
                  animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
                }} />
              )}

              {/* Pin Bubble */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                backgroundColor: isSelected ? "#ffffff" : "var(--bg-surface)",
                color: isSelected ? "#0f172a" : "#ffffff",
                borderRadius: "var(--radius-full)",
                border: `2px solid ${sev.color}`,
                boxShadow: isSelected ? "0 0 16px rgba(59, 130, 246, 0.8)" : "0 4px 12px rgba(0,0,0,0.5)",
                fontSize: "0.75rem",
                fontWeight: "700",
                whiteSpace: "nowrap"
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: sev.color }} />
                <span>{cat.label.split(" ")[0]}</span>
              </div>
            </div>
          );
        })}

        {/* Floating Selected Pin Info Card (Bottom Left) */}
        {selectedReport && (
          <div style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            maxWidth: "380px",
            width: "calc(100% - 40px)",
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            padding: "18px",
            zIndex: 40,
            boxShadow: "var(--shadow-lg)"
          }}>
            <div className="flex-between" style={{ marginBottom: "8px" }}>
              <span className="badge" style={{ backgroundColor: `${CATEGORY_DETAILS[selectedReport.category].color}22`, color: CATEGORY_DETAILS[selectedReport.category].color }}>
                {CATEGORY_DETAILS[selectedReport.category].label}
              </span>
              <span className="badge" style={{ backgroundColor: STATUS_DETAILS[selectedReport.status].bgColor, color: STATUS_DETAILS[selectedReport.status].color }}>
                {STATUS_DETAILS[selectedReport.status].label}
              </span>
            </div>

            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", marginBottom: "6px" }}>
              {selectedReport.description}
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px" }}>
              <MapPin size={14} color="var(--primary)" />
              <span>{selectedReport.address}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid var(--border-color)", fontSize: "0.75rem" }}>
              <span className="mono" style={{ color: "var(--text-muted)" }}>
                GPS: {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
              </span>
              <span style={{ color: "var(--text-secondary)" }}>
                Reporter: <strong>{selectedReport.reporterName}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Map Telemetry Compass & Legend (Top Right) */}
        <div style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          backgroundColor: "rgba(17, 24, 39, 0.9)",
          backdropFilter: "blur(8px)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          fontSize: "0.75rem",
          zIndex: 20
        }}>
          <div style={{ fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Compass size={14} color="var(--primary)" />
            <span>Severity Matrix</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
            <span style={{ color: "var(--text-secondary)" }}>Critical / High Priority</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
            <span style={{ color: "var(--text-secondary)" }}>Medium Priority</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            <span style={{ color: "var(--text-secondary)" }}>Low / Routine Check</span>
          </div>
        </div>
      </div>
    </div>
  );
}
