"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Award,
  Users,
  ShieldCheck,
  BarChart3,
  Gift,
  Megaphone,
  Settings,
  Building2,
} from "lucide-react";

// Everything lives on the single dashboard page today, so nav items point at
// in-page sections (closest matching widget) rather than separate routes.
const NAV_ITEMS: { href: string; label: string; icon: typeof LayoutDashboard; enabled: boolean }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { href: "/#recent-reports", label: "Reports", icon: FileText, enabled: true },
  { href: "/", label: "Quests", icon: Award, enabled: true },
  { href: "/#top-reporters", label: "Users", icon: Users, enabled: true },
  { href: "/#status-breakdown", label: "Verifications", icon: ShieldCheck, enabled: true },
  { href: "/#analytics-section", label: "Analytics", icon: BarChart3, enabled: true },
  { href: "/#impact-summary", label: "Rewards & Tokens", icon: Gift, enabled: true },
  { href: "/#recent-activities", label: "Announcements", icon: Megaphone, enabled: true },
  { href: "/", label: "Settings", icon: Settings, enabled: true },
];

export function Sidebar({ organizationName }: { organizationName: string }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div style={{ padding: "22px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            backgroundColor: "var(--navy-elevated)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--gov-green)",
            flexShrink: 0,
          }}
        >
          <Building2 size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-on-navy)", lineHeight: "1.25" }}>
            Sustainable Community
            <br />
            Digital Twin
          </h2>
          <span
            style={{
              display: "inline-block",
              marginTop: "6px",
              fontSize: "0.68rem",
              fontWeight: "700",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--gov-green-light)",
              color: "#4ade80",
            }}
          >
            Authority Dashboard
          </span>
        </div>
      </div>

      <nav style={{ padding: "14px 10px", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.enabled && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
          const Icon = item.icon;

          const content = (
            <>
              <Icon size={17} color={isActive ? "#ffffff" : item.enabled ? "var(--text-on-navy-muted)" : "rgba(157, 176, 194, 0.45)"} />
              <span>{item.label}</span>
            </>
          );

          const style: CSSProperties = {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "9px 13px",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            fontWeight: isActive ? 600 : 500,
            color: isActive ? "#ffffff" : item.enabled ? "var(--text-on-navy-muted)" : "rgba(157, 176, 194, 0.45)",
            backgroundColor: isActive ? "var(--navy-elevated)" : "transparent",
            cursor: item.enabled ? "pointer" : "not-allowed",
          };

          if (!item.enabled) {
            return (
              <div key={item.href} style={style} aria-disabled="true" title="Not yet available in this phase">
                {content}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} style={style}>
              {content}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--navy-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gov-green)",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-on-navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Municipal Administrator
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-on-navy-muted)" }}>{organizationName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
