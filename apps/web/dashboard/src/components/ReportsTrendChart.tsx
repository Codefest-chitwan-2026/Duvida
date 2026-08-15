"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReportsTrend } from "@/lib/data/types";
import { InlineUnavailable } from "@/components/DashboardStates";

export function ReportsTrendChart({ trend }: { trend: ReportsTrend }) {
  const hasData = trend.points.length > 0;

  return (
    <div className="card" style={{ height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--text-primary)" }}>Reports Trend</h2>
        {hasData && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "14px", height: "3px", borderRadius: "2px", backgroundColor: "var(--gov-green)", display: "inline-block" }} />
              Current period
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "14px",
                  height: "2px",
                  display: "inline-block",
                  backgroundImage: "repeating-linear-gradient(to right, var(--grey-accent) 0, var(--grey-accent) 4px, transparent 4px, transparent 7px)",
                }}
              />
              Previous period
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div style={{ height: "260px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <InlineUnavailable message="No historical report data available for this range yet." />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend.points} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--border-color)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border-color)", fontSize: "0.8rem" }} />
            <Line type="monotone" dataKey="currentPeriod" name="Current period" stroke="var(--gov-green)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="previousPeriod" name="Previous period" stroke="var(--grey-accent)" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2.5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
