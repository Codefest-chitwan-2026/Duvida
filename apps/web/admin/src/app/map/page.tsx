"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MOCK_REPORTS, 
  CATEGORY_DETAILS, 
  SEVERITY_DETAILS, 
  STATUS_DETAILS, 
  type ReportSummary, 
  type ReportCategory,
  type ReportStatus
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
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Clock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function DigitalTwinMapPage() {
  const [reports, setReports] = useState<ReportSummary[]>(MOCK_REPORTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(MOCK_REPORTS[0]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const filteredReports = reports.filter((r) => {
    const matchesCategory = selectedCategory === "all" ? true : r.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "all" ? true : r.severity === selectedSeverity;
    const matchesSearch = searchQuery.trim() === "" ? true :
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.address && r.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.reporterName && r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  // Map center reference
  const centerLat = 12.9716;
  const centerLng = 77.5946;

  // Convert GPS coordinates to 2D SVG canvas percentages with zoom and pan
  const getMapPosition = (lat: number, lng: number) => {
    const dLat = lat - centerLat;
    const dLng = lng - centerLng;
    // Scale for visual clarity on canvas
    const x = 50 + dLng * 2500 * zoomLevel + panOffset.x;
    const y = 50 - dLat * 2500 * zoomLevel + panOffset.y;
    return {
      left: `${Math.max(6, Math.min(94, x))}%`,
      top: `${Math.max(6, Math.min(94, y))}%`,
    };
  };

  const handleQuickStatus = (id: string, newStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r))
    );
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 68px)", paddingBottom: "20px" }}>
      {/* Top Controls */}
      <div className="flex-between" style={{ marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="page-title">Digital Twin Spatial Telemetry</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Geospatial PostGIS incident distribution, cluster density, and infrastructure status.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div style={{ position: "relative", width: "220px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search incidents / streets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control"
              style={{ paddingLeft: "32px", fontSize: "0.82rem" }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-control"
            style={{ width: "170px", fontSize: "0.82rem" }}
          >
            <option value="all">All Incident Layers</option>
            {Object.keys(CATEGORY_DETAILS).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_DETAILS[cat as ReportCategory].label}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="input-control"
            style={{ width: "140px", fontSize: "0.82rem" }}
          >
            <option value="all">All Severities</option>
            <option value="high">Critical / High</option>
            <option value="medium">Medium</option>
            <option value="low">Low Priority</option>
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
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0, opacity: 0.65 }}
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
            <linearGradient id="waterFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* District Sector Polygons */}
          <path d="M 80 80 L 450 60 L 420 380 L 60 340 Z" fill="#0f172a" opacity="0.6" stroke="#1e293b" strokeWidth="1" />
          <path d="M 650 100 L 1100 80 L 1050 420 L 680 390 Z" fill="#0f172a" opacity="0.6" stroke="#1e293b" strokeWidth="1" />
          <path d="M 120 560 L 480 520 L 440 850 L 100 820 Z" fill="#0f172a" opacity="0.6" stroke="#1e293b" strokeWidth="1" />

          {/* Stylized River Waterway */}
          <path d="M 0 480 Q 400 520 700 450 T 1400 380" fill="none" stroke="url(#waterFlow)" strokeWidth="36" strokeLinecap="round" />
          <path d="M 0 480 Q 400 520 700 450 T 1400 380" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />

          {/* Stylized Urban Arteries */}
          <path d="M 0 250 Q 300 200 600 350 T 1200 400" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
          <path d="M 200 0 Q 350 300 500 800" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
          <path d="M 700 0 Q 750 400 900 900" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
          <path d="M 0 500 Q 500 550 1200 480" fill="none" stroke="#1e293b" strokeWidth="4" opacity="0.6" />

          {/* Central Municipal Boundary Circle */}
          <circle cx="50%" cy="50%" r="220" fill="url(#glowGrad)" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6,6" opacity="0.4" />

          {/* District Labels */}
          <text x="120" y="140" fill="#64748b" fontSize="11" fontWeight="700" opacity="0.8">SECTOR 1: NORTH CIVIC</text>
          <text x="750" y="160" fill="#64748b" fontSize="11" fontWeight="700" opacity="0.8">SECTOR 2: TECH HUB</text>
          <text x="180" y="620" fill="#64748b" fontSize="11" fontWeight="700" opacity="0.8">SECTOR 3: RESIDENTIAL</text>
          <text x="50%" y="50%" fill="#38bdf8" fontSize="12" fontWeight="800" textAnchor="middle" opacity="0.85">CENTRAL MUNICIPAL GRID</text>
        </svg>

        {/* Heatmap Layer if Active */}
        {showHeatmap && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 52% 48%, rgba(239, 68, 68, 0.3) 0%, rgba(245, 158, 11, 0.18) 30%, transparent 65%)",
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
                transition: "all 0.2s ease",
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
                padding: isSelected ? "8px 12px" : "6px 10px",
                backgroundColor: isSelected ? "#ffffff" : "var(--bg-surface)",
                color: isSelected ? "#0f172a" : "#ffffff",
                borderRadius: "var(--radius-full)",
                border: `2px solid ${sev.color}`,
                boxShadow: isSelected ? "0 0 20px rgba(59, 130, 246, 0.9)" : "0 4px 12px rgba(0,0,0,0.5)",
                fontSize: "0.75rem",
                fontWeight: "700",
                whiteSpace: "nowrap",
                transform: isSelected ? "scale(1.08)" : "scale(1)",
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: sev.color }} />
                <span>{cat.label.split(" ")[0]}</span>
              </div>
            </div>
          );
        })}

        {/* Zoom & Pan Overlay Toolbar (Top Left) */}
        <div style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          zIndex: 20
        }}>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className="btn btn-secondary btn-sm"
            style={{ width: "36px", height: "36px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)" }}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="btn btn-secondary btn-sm"
            style={{ width: "36px", height: "36px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)" }}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleResetView}
            className="btn btn-secondary btn-sm"
            style={{ width: "36px", height: "36px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)" }}
            title="Reset Map View"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Floating Selected Pin Info Card (Bottom Left) */}
        {selectedReport && (
          <div style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            maxWidth: "420px",
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
              <div style={{ display: "flex", gap: "6px" }}>
                <span className="badge" style={{ backgroundColor: `${CATEGORY_DETAILS[selectedReport.category].color}22`, color: CATEGORY_DETAILS[selectedReport.category].color }}>
                  {CATEGORY_DETAILS[selectedReport.category].label}
                </span>
                <span className="badge" style={{ backgroundColor: SEVERITY_DETAILS[selectedReport.severity].bgColor, color: SEVERITY_DETAILS[selectedReport.severity].color }}>
                  {SEVERITY_DETAILS[selectedReport.severity].label}
                </span>
              </div>
              <span className="badge" style={{ backgroundColor: STATUS_DETAILS[selectedReport.status].bgColor, color: STATUS_DETAILS[selectedReport.status].color }}>
                {STATUS_DETAILS[selectedReport.status].label}
              </span>
            </div>

            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", marginBottom: "6px" }}>
              {selectedReport.description}
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px" }}>
              <MapPin size={14} color="var(--primary)" />
              <span>{selectedReport.address || `${selectedReport.latitude.toFixed(4)}, ${selectedReport.longitude.toFixed(4)}`}</span>
            </div>

            {/* Fast Action Buttons in Inspector */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {selectedReport.status === "submitted" && (
                <button
                  onClick={() => handleQuickStatus(selectedReport.id, "verified")}
                  className="btn btn-secondary btn-sm"
                  style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}
                >
                  <ShieldCheck size={14} />
                  <span>Verify Incident</span>
                </button>
              )}
              {selectedReport.status === "verified" && (
                <button
                  onClick={() => handleQuickStatus(selectedReport.id, "in_progress")}
                  className="btn btn-secondary btn-sm"
                  style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}
                >
                  <Clock size={14} />
                  <span>Dispatch Crew</span>
                </button>
              )}
              {selectedReport.status === "in_progress" && (
                <button
                  onClick={() => handleQuickStatus(selectedReport.id, "resolved")}
                  className="btn btn-secondary btn-sm"
                  style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Resolved</span>
                </button>
              )}
              <Link href="/reports" className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }}>
                <span>Report View</span>
                <ArrowRight size={13} />
              </Link>
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
            <span>Telemetry & Legend ({filteredReports.length} incidents)</span>
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
