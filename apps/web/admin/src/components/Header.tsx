"use client";

import { Bell, Search, RefreshCw, Radio } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 800);
  };

  return (
    <header className="top-header">
      {/* Search / Global Quick Finder */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "360px" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search reports, GPS coordinates, or tickets..."
            className="input-control"
            style={{ width: "100%", paddingLeft: "36px", height: "38px" }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Realtime Broadcast Badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          color: "#34d399",
          fontSize: "0.775rem",
          fontWeight: "600"
        }}>
          <Radio size={13} className="animate-pulse" />
          <span>Live Digital Twin Sync</span>
        </div>

        {/* Sync / Refresh Button */}
        <button
          onClick={handleSync}
          className="btn btn-secondary btn-sm"
          title="Refresh Data"
          style={{ height: "36px", padding: "0 12px" }}
        >
          <RefreshCw size={15} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
          <span>Sync</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ width: "36px", height: "36px", padding: 0 }}
          >
            <Bell size={16} />
          </button>
          <span style={{
            position: "absolute",
            top: "-3px",
            right: "-3px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "var(--danger)"
          }} />
        </div>
      </div>
    </header>
  );
}
