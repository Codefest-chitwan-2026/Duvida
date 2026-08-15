// Shared data contract for the Municipal Authority Dashboard.
// Any provider (mock, Supabase, ...) implements DashboardDataProvider so the
// UI layer never depends on where the data actually comes from.

export type ReportStatus =
  | "submitted"
  | "pending_review"
  | "verified"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected";

export type SeverityLevel = "low" | "medium" | "high";

export interface SummaryMetric {
  label: string;
  value: number;
  changePercent: number | null;
  changeDirection: "up" | "down" | "flat";
}

export interface DashboardSummary {
  totalReports: SummaryMetric;
  verifiedReports: SummaryMetric;
  pendingReview: SummaryMetric;
  activeUsers: SummaryMetric;
  questsCompleted: SummaryMetric;
}

export interface CategoryBreakdownItem {
  category: string;
  count: number;
  percent: number;
  color: string;
}

export interface TrendPoint {
  label: string;
  currentPeriod: number;
  previousPeriod: number;
}

export interface ReportsTrend {
  points: TrendPoint[];
}

export interface RecentReport {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  ward: string;
  location: string;
  reportedAgo: string;
  severity: SeverityLevel;
  status: ReportStatus;
}

export interface TopReporter {
  rank: number;
  name: string;
  reportsSubmitted: number;
  participationScore: number;
}

export interface StatusBreakdownItem {
  status: ReportStatus;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  actor: string;
  action: string;
  ago: string;
}

export interface TodaySummaryMetric {
  label: string;
  value: number;
  sparkline: number[];
}

export interface ImpactMetric {
  label: string;
  value: number;
  changeLabel: string;
}

export interface DashboardFilters {
  wards: string[];
  statuses: { value: ReportStatus; label: string }[];
}

export interface DashboardData {
  organizationName: string;
  summary: DashboardSummary;
  categoryBreakdown: CategoryBreakdownItem[];
  reportsTrend: ReportsTrend;
  recentReports: RecentReport[];
  topReporters: TopReporter[];
  statusBreakdown: StatusBreakdownItem[];
  recentActivities: RecentActivity[];
  todaySummary: TodaySummaryMetric[];
  impactSummary: ImpactMetric[];
  filters: DashboardFilters;
}

// A provider fetches DashboardData for a given filter selection.
// `source` tells the UI whether it's looking at mock or live data so it can
// show the "Using demo data" indicator.
export interface DashboardDataProvider {
  source: "mock" | "supabase";
  getDashboardData(params?: { wardFilter?: string; statusFilter?: ReportStatus | "all" }): Promise<DashboardData>;
}
