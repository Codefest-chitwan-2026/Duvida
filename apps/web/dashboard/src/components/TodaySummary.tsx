"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { TodaySummaryMetric } from "@/lib/data/types";
import { InlineUnavailable } from "@/components/DashboardStates";

export function TodaySummary({ metrics }: { metrics: TodaySummaryMetric[] }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--text-primary)" }}>Today&rsquo;s Summary</h2>
      </div>

      {metrics.length === 0 ? (
        <InlineUnavailable message="No activity recorded today." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "4px" }}>{metric.label}</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                {metric.value.toLocaleString()}
              </div>
              <div style={{ height: "28px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.sparkline.map((v, i) => ({ i, v }))}>
                    <Line type="monotone" dataKey="v" stroke="var(--gov-green)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
