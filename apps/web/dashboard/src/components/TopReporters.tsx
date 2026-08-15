import type { TopReporter } from "@/lib/data/types";
import { InlineUnavailable } from "@/components/DashboardStates";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopReporters({ reporters }: { reporters: TopReporter[] }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--text-primary)" }}>Top Reporters</h2>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>View All</span>
      </div>

      {reporters.length === 0 ? (
        <InlineUnavailable message="No verified community participation recorded yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reporters.map((reporter) => (
            <div key={reporter.rank} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "16px", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>{reporter.rank}</span>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: "var(--navy)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials(reporter.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--text-primary)" }}>{reporter.name}</p>
                <p style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Reports: {reporter.reportsSubmitted}</p>
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: 700, color: "var(--gov-green)" }}>
                {reporter.participationScore.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
