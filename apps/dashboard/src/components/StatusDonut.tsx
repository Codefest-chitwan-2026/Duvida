"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusBreakdownItem } from "@/lib/data/types";
import { InlineUnavailable } from "@/components/DashboardStates";

export function StatusDonut({ items }: { items: StatusBreakdownItem[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="card">
      <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "14px" }}>
        Reports by Status
      </h2>

      {items.length === 0 ? (
        <InlineUnavailable message="No status data available." />
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ position: "relative", width: "150px", height: "150px", flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={items} dataKey="count" nameKey="label" innerRadius={48} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                  {items.map((item) => (
                    <Cell key={item.status} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString()} reports`, name]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border-color)", fontSize: "0.8rem" }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)" }}>{total.toLocaleString()}</span>
              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Total</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0 }}>
            {items.map((item) => (
              <div key={item.status} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{item.label}</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {item.count.toLocaleString()} ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
