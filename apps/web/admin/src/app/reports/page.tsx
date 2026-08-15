"use client";

import { useState } from "react";
import { 
  MOCK_REPORTS, 
  CATEGORY_DETAILS, 
  SEVERITY_DETAILS, 
  STATUS_DETAILS, 
  REPORT_STATUSES,
  REPORT_CATEGORIES,
  REPORT_SEVERITIES,
  type ReportSummary, 
  type ReportStatus,
  type ReportCategory,
  type ReportSeverity
} from "@duvidha/shared";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  MapPin, 
  User, 
  Calendar, 
  ShieldAlert, 
  Copy,
  ExternalLink,
  ChevronDown
} from "lucide-react";

export default function ReportsQueuePage() {
  const [reports, setReports] = useState<ReportSummary[]>(MOCK_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [activeReport, setActiveReport] = useState<ReportSummary | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      searchQuery === "" ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "all" || r.status === selectedStatus;
    const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;
    const matchesSeverity = selectedSeverity === "all" || r.severity === selectedSeverity;

    return matchesSearch && matchesStatus && matchesCategory && matchesSeverity;
  });

  const handleStatusChange = (id: string, newStatus: ReportStatus, note?: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated: ReportSummary = {
            ...r,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            verifiedAt: newStatus === "verified" ? new Date().toISOString() : r.verifiedAt,
            resolvedAt: newStatus === "resolved" ? new Date().toISOString() : r.resolvedAt,
          };
          if (activeReport?.id === id) {
            setActiveReport(updated);
          }
          return updated;
        }
        return r;
      })
    );

    setActionSuccessMsg(`Report #${id} status updated to "${STATUS_DETAILS[newStatus].label}". Realtime update broadcast.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="flex-between" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Reports Moderation & Triage Queue</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Audit citizen submissions, verify photographic evidence, assign field teams, and track resolution lifecycles.
          </p>
        </div>
      </div>

      {actionSuccessMsg && (
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
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: "20px", padding: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, reporter, address, ID..."
              className="input-control"
              style={{ width: "100%", paddingLeft: "34px" }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-control"
            style={{ flex: "0 1 160px" }}
          >
            <option value="all">All Statuses ({reports.length})</option>
            {REPORT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_DETAILS[st].label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-control"
            style={{ flex: "0 1 170px" }}
          >
            <option value="all">All Categories</option>
            {REPORT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_DETAILS[cat].label}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="input-control"
            style={{ flex: "0 1 150px" }}
          >
            <option value="all">All Severities</option>
            {REPORT_SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {SEVERITY_DETAILS[sev].label}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {(searchQuery || selectedStatus !== "all" || selectedCategory !== "all" || selectedSeverity !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
                setSelectedCategory("all");
                setSelectedSeverity("all");
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table of Reports */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID & Incident</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Location & Reporter</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No reports matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const cat = CATEGORY_DETAILS[report.category];
                const sev = SEVERITY_DETAILS[report.severity];
                const st = STATUS_DETAILS[report.status];

                return (
                  <tr key={report.id} style={{ cursor: "pointer" }} onClick={() => setActiveReport(report)}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {report.id}
                        </span>
                        <span style={{ fontWeight: "600", color: "var(--text-primary)", maxWidth: "260px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {report.description}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}
                      >
                        {cat.label}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: sev.bgColor, color: sev.color, border: `1px solid ${sev.borderColor}` }}
                      >
                        {sev.label}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: st.bgColor, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                          {report.reporterName}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {report.address || `${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReport(report);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <span>Audit / Triage</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal / Report Detail Drawer */}
      {activeReport && (
        <div className="modal-overlay" onClick={() => setActiveReport(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
              <div>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  INCIDENT #{activeReport.id}
                </span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {CATEGORY_DETAILS[activeReport.category].label}
                </h2>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: "4px 10px" }}
              >
                ✕
              </button>
            </div>

            {/* Badges Bar */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
              <span
                className="badge"
                style={{
                  backgroundColor: SEVERITY_DETAILS[activeReport.severity].bgColor,
                  color: SEVERITY_DETAILS[activeReport.severity].color,
                  border: `1px solid ${SEVERITY_DETAILS[activeReport.severity].borderColor}`
                }}
              >
                {SEVERITY_DETAILS[activeReport.severity].label}
              </span>
              <span
                className="badge"
                style={{
                  backgroundColor: STATUS_DETAILS[activeReport.status].bgColor,
                  color: STATUS_DETAILS[activeReport.status].color
                }}
              >
                Status: {STATUS_DETAILS[activeReport.status].label}
              </span>
              {activeReport.confirmationsCount && (
                <span className="badge" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                  ★ {activeReport.confirmationsCount} Citizen Confirmations
                </span>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                Citizen Description
              </div>
              <div style={{
                padding: "14px",
                backgroundColor: "var(--bg-surface-elevated)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                fontSize: "0.9rem",
                lineHeight: "1.5"
              }}>
                {activeReport.description}
              </div>
            </div>

            {/* Location & Metadata */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>GEOGRAPHIC LOCATION</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span>{activeReport.latitude.toFixed(4)}, {activeReport.longitude.toFixed(4)}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {activeReport.address}
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>REPORTER & TIMELINE</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <User size={14} color="var(--primary)" />
                  <span>{activeReport.reporterName}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Reported on {new Date(activeReport.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Authority Actions & Lifecycle Controls */}
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
                Authority Moderation Workflow
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {activeReport.status !== "verified" && activeReport.status !== "resolved" && (
                  <button
                    onClick={() => handleStatusChange(activeReport.id, "verified")}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle2 size={15} />
                    <span>Verify Incident</span>
                  </button>
                )}

                {activeReport.status !== "assigned" && activeReport.status !== "resolved" && (
                  <button
                    onClick={() => handleStatusChange(activeReport.id, "assigned")}
                    className="btn btn-secondary btn-sm"
                    style={{ color: "#a855f7" }}
                  >
                    <span>Assign Field Crew</span>
                  </button>
                )}

                {activeReport.status !== "in_progress" && activeReport.status !== "resolved" && (
                  <button
                    onClick={() => handleStatusChange(activeReport.id, "in_progress")}
                    className="btn btn-secondary btn-sm"
                    style={{ color: "#fbbf24" }}
                  >
                    <Clock size={15} />
                    <span>Mark In Progress</span>
                  </button>
                )}

                {activeReport.status !== "resolved" && (
                  <button
                    onClick={() => handleStatusChange(activeReport.id, "resolved")}
                    className="btn btn-success btn-sm"
                  >
                    <CheckCircle2 size={15} />
                    <span>Confirm Resolved & Award Impact</span>
                  </button>
                )}

                {activeReport.status !== "rejected" && activeReport.status !== "resolved" && (
                  <button
                    onClick={() => handleStatusChange(activeReport.id, "rejected")}
                    className="btn btn-secondary btn-sm"
                    style={{ color: "#f87171" }}
                  >
                    <XCircle size={15} />
                    <span>Reject</span>
                  </button>
                )}

                {activeReport.status !== "duplicate" && (
                  <button
                    onClick={() => handleStatusChange(activeReport.id, "duplicate")}
                    className="btn btn-secondary btn-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Copy size={15} />
                    <span>Link Duplicate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
