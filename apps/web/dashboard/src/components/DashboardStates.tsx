import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";

export function LoadingState() {
  return (
    <div className="page-container">
      <div style={{ height: "38px", width: "320px", marginBottom: "28px" }} className="skeleton" />
      <div className="metric-grid" style={{ marginBottom: "24px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: "128px", borderRadius: "14px" }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "40% 60%", gap: "20px" }}>
        <div className="skeleton" style={{ height: "320px", borderRadius: "14px" }} />
        <div className="skeleton" style={{ height: "320px", borderRadius: "14px" }} />
      </div>
    </div>
  );
}

export function EmptyState({ title = "No data available yet", message = "Once reports start coming in from citizens, this dashboard will populate automatically." }: { title?: string; message?: string }) {
  return (
    <div className="page-container">
      <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center", gap: "12px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--bg-surface-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Inbox size={22} color="var(--text-muted)" />
        </div>
        <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-primary)" }}>{title}</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "420px" }}>{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="page-container">
      <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center", gap: "12px", borderColor: "rgba(185, 28, 28, 0.3)" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertTriangle size={22} color="var(--red)" />
        </div>
        <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-primary)" }}>Unable to load dashboard data</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "420px" }}>{message}</p>
        <button onClick={onRetry} className="btn btn-secondary btn-sm" style={{ marginTop: "8px" }}>
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
}

export function InlineUnavailable({ message }: { message: string }) {
  return (
    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>{message}</span>
  );
}
