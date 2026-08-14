export const REPORT_CATEGORIES = [
  "pothole",
  "garbage",
  "streetlight",
  "traffic",
  "environmental",
  "water",
  "infrastructure",
  "civic",
] as const;

export const REPORT_SEVERITIES = ["low", "medium", "high"] as const;

export const REPORT_STATUSES = [
  "submitted",
  "under_review",
  "verified",
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
  "duplicate",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type ReportSeverity = (typeof REPORT_SEVERITIES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface ReportSummary {
  id: string;
  reporterId: string;
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  description: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}
