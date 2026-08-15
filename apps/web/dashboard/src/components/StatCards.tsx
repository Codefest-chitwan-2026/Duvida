import { FileCheck2, FileClock, FileStack, ShieldCheck, Users } from "lucide-react";
import type { DashboardSummary } from "@/lib/data/types";

const CARD_CONFIG = [
  { key: "totalReports", icon: FileStack, color: "var(--navy)", bg: "rgba(15, 36, 56, 0.08)" },
  { key: "verifiedReports", icon: ShieldCheck, color: "var(--gov-green)", bg: "var(--gov-green-light)" },
  { key: "pendingReview", icon: FileClock, color: "var(--amber)", bg: "var(--amber-light)" },
  { key: "activeUsers", icon: Users, color: "var(--blue)", bg: "var(--blue-light)" },
  { key: "questsCompleted", icon: FileCheck2, color: "var(--purple)", bg: "var(--purple-light)" },
] as const;

export function StatCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="metric-grid">
      {CARD_CONFIG.map(({ key, icon: Icon, color, bg }) => {
        const metric = summary[key];
        const changeColor = metric.changeDirection === "up" ? "var(--gov-green)" : metric.changeDirection === "down" ? "var(--red)" : "var(--text-muted)";
        const changeSign = metric.changeDirection === "up" ? "↑" : metric.changeDirection === "down" ? "↓" : "";

        return (
          <div key={key} className="card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "var(--radius-md)",
                backgroundColor: bg,
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={19} />
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {metric.value.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>{metric.label}</div>
            {metric.changePercent !== null && (
              <div style={{ fontSize: "0.76rem", color: changeColor, fontWeight: 600 }}>
                {changeSign} {metric.changePercent}% vs last week
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
