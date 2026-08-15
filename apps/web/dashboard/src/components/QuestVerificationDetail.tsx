import { Award, Check, ImageOff, MapPin, User, X } from "lucide-react";
import type { QuestVerificationItem } from "@/lib/data/quests-types";

function ProofTile({ label, src }: { label: string; src: string | null }) {
  return (
    <div style={{ flex: 1, minWidth: "180px" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: "6px" }}>
        {label}
      </p>
      <div
        style={{
          aspectRatio: "4 / 3",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--bg-surface-muted)",
          border: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
            <ImageOff size={22} />
            <span style={{ fontSize: "0.72rem" }}>No image yet</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuestVerificationDetail({
  item,
  isActioning,
  onVerify,
  onReject,
}: {
  item: QuestVerificationItem | null;
  isActioning: boolean;
  onVerify: (participantId: string) => void;
  onReject: (participantId: string) => void;
}) {
  if (!item) {
    return (
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "320px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        Select a submission from the list to review proof.
      </div>
    );
  }

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-primary)" }}>{item.questTitle}</h2>
          {item.address && (
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
              <MapPin size={12} />
              {item.address}
              {item.city ? `, ${item.city}` : ""}
            </p>
          )}
        </div>
        <span className="badge" style={{ backgroundColor: "var(--stone-light)", color: "var(--stone)" }}>Submitted</span>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <ProofTile label="Before" src={item.beforeImageUrl} />
        <ProofTile label="After (Proof)" src={item.afterImageUrl} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "12px 0", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "2px" }}>User</p>
          <p style={{ fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <User size={14} />
            {item.userName}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "2px" }}>User ID</p>
          <p className="mono" style={{ fontSize: "0.85rem", fontWeight: "600" }}>{item.userId}</p>
        </div>
        <div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "2px" }}>Reward</p>
          <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--gov-green)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Award size={14} />
            {item.reward} tokens
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "2px" }}>Submitted</p>
          <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>{item.submittedAgo}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={isActioning}
          onClick={() => onVerify(item.participantId)}
          style={{ flex: 1, justifyContent: "center" }}
        >
          <Check size={16} />
          Verify
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={isActioning}
          onClick={() => onReject(item.participantId)}
          style={{ flex: 1, justifyContent: "center", color: "var(--red)", borderColor: "var(--red-light)" }}
        >
          <X size={16} />
          Reject
        </button>
      </div>
    </div>
  );
}
