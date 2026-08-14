import { FlaskConical } from "lucide-react";

// Subtle indicator shown only while the mock data provider is active.
// Disappears automatically once a live (Supabase) provider is wired in,
// since `source` will report "supabase" instead of "mock".
export function DemoDataBadge({ source }: { source: "mock" | "supabase" }) {
  if (source !== "mock") return null;

  return (
    <span
      title="This dashboard is showing development-only mock data, not live Supabase data."
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "var(--radius-full)",
        backgroundColor: "var(--amber-light)",
        color: "var(--amber)",
        fontSize: "0.72rem",
        fontWeight: "600",
      }}
    >
      <FlaskConical size={12} />
      <span>Using demo data</span>
    </span>
  );
}
