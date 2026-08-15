"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Map, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Activity,
  Layers
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard Overview", icon: LayoutDashboard },
  { href: "/reports", label: "Reports Queue", icon: FileText, badge: "6 Active" },
  { href: "/map", label: "Digital Twin Map", icon: Map },
  { href: "/quests", label: "Quests & Proofs", icon: Award },
  { href: "/impact", label: "Impact & Carbon", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: "24px 22px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #3b82f6, #10b981)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff"
        }}>
          <Layers size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "700", letterSpacing: "-0.02em", color: "#ffffff" }}>
            Team Duvidha
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>
            Authority Digital Twin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ padding: "8px 12px", fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Authority Management
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                border: isActive ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Icon size={18} color={isActive ? "var(--primary)" : "var(--text-muted)"} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: "0.7rem",
                  padding: "2px 7px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  color: "#60a5fa",
                  fontWeight: "600"
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Authority Profile / Status Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-color)", backgroundColor: "rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            backgroundColor: "var(--bg-surface-hover)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)"
          }}>
            <ShieldCheck size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.825rem", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Municipal Ops Team
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--success)" }} />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Supabase Realtime</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
