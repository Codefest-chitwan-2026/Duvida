import { Award, Clock, User } from "lucide-react";
import type { QuestVerificationItem } from "@/lib/data/quests-types";

export function QuestVerificationList({
  items,
  selectedId,
  onSelect,
}: {
  items: QuestVerificationItem[];
  selectedId: string | null;
  onSelect: (participantId: string) => void;
}) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: "1.02rem", fontWeight: "700", color: "var(--text-primary)" }}>Verification Needed</h2>
        <span className="badge" style={{ backgroundColor: "var(--amber-light)", color: "var(--amber)" }}>
          {items.length} pending
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "clamp(480px, 70vh, 780px)", overflowY: "auto", paddingRight: "2px" }}>
        {items.map((item) => {
          const isActive = item.participantId === selectedId;
          return (
            <button
              key={item.participantId}
              type="button"
              onClick={() => onSelect(item.participantId)}
              className="list-row"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                textAlign: "left",
                width: "100%",
                background: isActive ? "var(--bg-surface-muted)" : "none",
                border: `1px solid ${isActive ? "var(--gov-green)" : "transparent"}`,
                font: "inherit",
                color: "inherit",
              }}
            >
              <p style={{ fontSize: "0.86rem", fontWeight: "600", color: "var(--text-primary)" }}>{item.questTitle}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "0.74rem", color: "var(--text-muted)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <User size={12} />
                  {item.userName}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} />
                  {item.submittedAgo}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--gov-green)", fontWeight: 600 }}>
                  <Award size={12} />
                  {item.reward} pts
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
