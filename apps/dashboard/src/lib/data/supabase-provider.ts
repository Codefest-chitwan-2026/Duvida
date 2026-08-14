import type { DashboardData, DashboardDataProvider, ReportStatus, SummaryMetric } from "./types";
import { getSupabaseClient } from "../supabase";

type ReportRow = {
  id: string; reporter_id: string | null; title?: string | null; description: string;
  category: string; severity: string; status: string; ward?: string | number | null;
  address?: string | null; location?: string | null; created_at: string; updated_at: string;
};
type ProfileRow = { id: string; display_name?: string | null; points?: number | null };

const DAY = 86_400_000;
const statuses: ReportStatus[] = ["submitted", "pending_review", "verified", "assigned", "in_progress", "resolved", "rejected"];
const statusLabels: Record<ReportStatus, string> = { submitted: "Submitted", pending_review: "Pending Review", verified: "Verified", assigned: "Assigned", in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected" };
const statusColors: Record<ReportStatus, string> = { submitted: "#64748b", pending_review: "#b45309", verified: "#16794f", assigned: "#7c3aed", in_progress: "#1d4ed8", resolved: "#6d28d9", rejected: "#b91c1c" };
const categoryColors = ["#16794f", "#1d4ed8", "#0891b2", "#b45309", "#6d28d9", "#64748b"];

function statusOf(value: string): ReportStatus {
  if (value === "under_review") return "pending_review";
  return statuses.includes(value as ReportStatus) ? value as ReportStatus : "submitted";
}

function wardOf(report: ReportRow) {
  if (report.ward !== null && report.ward !== undefined && String(report.ward).trim()) {
    const ward = String(report.ward).trim();
    return /^ward\s/i.test(ward) ? ward : `Ward ${ward}`;
  }
  const match = (report.address ?? report.location ?? "").match(/ward\s*[-#:]?\s*(\d+)/i);
  return match ? `Ward ${match[1]}` : "Unassigned";
}

function ago(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

function metric(label: string, current: number, previous: number): SummaryMetric {
  const change = previous ? ((current - previous) / previous) * 100 : current ? 100 : 0;
  return { label, value: current, changePercent: Number(Math.abs(change).toFixed(1)), changeDirection: change > 0 ? "up" : change < 0 ? "down" : "flat" };
}

function dayStart(value = new Date()) {
  const date = new Date(value); date.setHours(0, 0, 0, 0); return date;
}

function between(rows: ReportRow[], start: Date, end: Date, predicate = (_row: ReportRow) => true) {
  return rows.filter((row) => { const date = new Date(row.created_at); return date >= start && date < end && predicate(row); }).length;
}

export const supabaseDashboardDataProvider: DashboardDataProvider = {
  source: "supabase",
  async getDashboardData(params): Promise<DashboardData> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const reports = (data ?? []) as ReportRow[];
    const profileIds = [...new Set(reports.map((row) => row.reporter_id).filter((id): id is string => Boolean(id)))];
    const profileResult = profileIds.length ? await supabase.from("profiles").select("id, display_name, points").in("id", profileIds) : { data: [] };
    const profiles = (profileResult.data ?? []) as ProfileRow[];
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
    const today = dayStart();
    const weekAgo = new Date(today.getTime() - 7 * DAY);
    const priorWeek = new Date(today.getTime() - 14 * DAY);
    const currentWeek = reports.filter((row) => new Date(row.created_at) >= weekAgo);
    const previousWeek = reports.filter((row) => new Date(row.created_at) >= priorWeek && new Date(row.created_at) < weekAgo);
    const verified = (row: ReportRow) => ["verified", "assigned", "in_progress", "resolved"].includes(statusOf(row.status));
    const pending = (row: ReportRow) => ["submitted", "pending_review"].includes(statusOf(row.status));
    const categoryCounts = new Map<string, number>();
    reports.forEach((row) => categoryCounts.set(row.category, (categoryCounts.get(row.category) ?? 0) + 1));
    const wards = [...new Set(reports.map(wardOf))].sort();
    const filtered = reports.filter((row) => (!params?.wardFilter || params.wardFilter === "all" || wardOf(row) === params.wardFilter) && (!params?.statusFilter || params.statusFilter === "all" || statusOf(row.status) === params.statusFilter));
    const reporterCounts = new Map<string, number>();
    reports.forEach((row) => row.reporter_id && reporterCounts.set(row.reporter_id, (reporterCounts.get(row.reporter_id) ?? 0) + 1));
    const trend = Array.from({ length: 7 }, (_, index) => {
      const start = new Date(today.getTime() - (6 - index) * DAY); const end = new Date(start.getTime() + DAY);
      return { label: start.toLocaleDateString(undefined, { weekday: "short" }), currentPeriod: between(reports, start, end), previousPeriod: between(reports, new Date(start.getTime() - 7 * DAY), start) };
    });
    const resolved = reports.filter((row) => statusOf(row.status) === "resolved");

    return {
      organizationName: process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "Municipal Authority",
      summary: {
        totalReports: metric("Total Reports", reports.length, Math.max(0, reports.length - currentWeek.length)),
        verifiedReports: metric("Verified Reports", reports.filter(verified).length, previousWeek.filter(verified).length),
        pendingReview: metric("Pending Review", reports.filter(pending).length, previousWeek.filter(pending).length),
        activeUsers: metric("Active Users", profileIds.length, new Set(previousWeek.map((row) => row.reporter_id).filter(Boolean)).size),
        questsCompleted: metric("Quests Completed", 0, 0),
      },
      categoryBreakdown: [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([category, count], index) => ({ category: category.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), count, percent: reports.length ? Number(((count / reports.length) * 100).toFixed(1)) : 0, color: categoryColors[index % categoryColors.length] })),
      reportsTrend: { points: trend },
      recentReports: filtered.slice(0, 8).map((row) => ({ id: row.id, title: row.title ?? row.description, category: row.category.replace(/_/g, " "), ward: wardOf(row), location: row.address ?? row.location ?? "Location unavailable", reportedAgo: ago(row.created_at), severity: ["low", "medium", "high"].includes(row.severity) ? row.severity as "low" | "medium" | "high" : "medium", status: statusOf(row.status) })),
      topReporters: [...reporterCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, count], index) => ({ rank: index + 1, name: profileById.get(id)?.display_name ?? "Citizen", reportsSubmitted: count, participationScore: profileById.get(id)?.points ?? 0 })),
      statusBreakdown: statuses.map((status) => { const count = reports.filter((row) => statusOf(row.status) === status).length; return { status, label: statusLabels[status], count, percent: reports.length ? Number(((count / reports.length) * 100).toFixed(1)) : 0, color: statusColors[status] }; }).filter((item) => item.count),
      recentActivities: reports.slice(0, 5).map((row) => ({ id: `${row.id}-${row.updated_at}`, actor: profileById.get(row.reporter_id ?? "")?.display_name ?? "Citizen Reporter", action: `${statusLabels[statusOf(row.status)].toLowerCase()} report ${row.id}`, ago: ago(row.updated_at) })),
      todaySummary: [
        { label: "Reports Submitted", value: between(reports, today, new Date(today.getTime() + DAY)), sparkline: trend.map((point) => point.currentPeriod) },
        { label: "Reports Verified", value: currentWeek.filter(verified).length, sparkline: trend.map((_, index) => { const start = new Date(today.getTime() - (6 - index) * DAY); return between(reports, start, new Date(start.getTime() + DAY), verified); }) },
        { label: "Quests Completed", value: 0, sparkline: Array(7).fill(0) },
        { label: "Impact Incentives Distributed", value: profiles.reduce((sum, profile) => sum + (profile.points ?? 0), 0), sparkline: Array(7).fill(0) },
      ],
      impactSummary: [
        { label: "Issues Resolved", value: resolved.length, changeLabel: `${resolved.filter((row) => new Date(row.updated_at) >= weekAgo).length} this week` },
        { label: "Cleanups Completed", value: resolved.filter((row) => ["garbage", "environmental"].includes(row.category)).length, changeLabel: "Verified reports" },
      ],
      filters: { wards, statuses: statuses.map((value) => ({ value, label: statusLabels[value] })) },
    };
  },
};
