import { CheckCircle2 } from "lucide-react";
import type { RecentActivity } from "@/lib/data/types";
import { InlineUnavailable } from "@/components/DashboardStates";

export function RecentActivities({ activities }: { activities: RecentActivity[] }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--text-primary)" }}>Recent Activities</h2>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>View All</span>
      </div>

      {activities.length === 0 ? (
        <InlineUnavailable message="No recent activity recorded." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {activities.map((activity) => (
            <div key={activity.id} style={{ display: "flex", gap: "10px" }}>
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  backgroundColor: "var(--gov-green-light)",
                  color: "var(--gov-green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                <CheckCircle2 size={14} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.4 }}>
                  <strong>{activity.actor}</strong> {activity.action}
                </p>
                <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: "2px" }}>{activity.ago}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
