import { Sprout, Trash2 } from "lucide-react";
import type { ImpactMetric } from "@/lib/data/types";
import { InlineUnavailable } from "@/components/DashboardStates";

const ICONS = [Sprout, Trash2];

export function ImpactSummary({ metrics }: { metrics: ImpactMetric[] }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--text-primary)" }}>Verified Impact Summary</h2>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>View Details</span>
      </div>

      {metrics.length === 0 ? (
        <InlineUnavailable message="No verified impact data available." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {metrics.map((metric, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={metric.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--gov-green-light)",
                    color: "var(--gov-green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{metric.label}</p>
                  <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>{metric.value.toLocaleString()}</p>
                </div>
                <span style={{ fontSize: "0.76rem", color: "var(--gov-green)", fontWeight: 600 }}>{metric.changeLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
