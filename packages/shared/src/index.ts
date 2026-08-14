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

export const USER_ROLES = ["citizen", "authority", "admin"] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type ReportSeverity = (typeof REPORT_SEVERITIES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type UserRole = (typeof USER_ROLES)[number];

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportMedia {
  id: string;
  reportId: string;
  uploaderId: string;
  storagePath: string;
  mediaType: "image" | "video";
  createdAt: string;
}

export interface ReportStatusHistoryItem {
  id: number;
  reportId: string;
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus;
  changedBy?: string;
  changedByName?: string;
  note?: string;
  createdAt: string;
}

export interface ReportSummary {
  id: string;
  reporterId: string;
  reporterName?: string;
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  assignedTo?: string;
  assignedToName?: string;
  duplicateOf?: string;
  verifiedAt?: string;
  resolvedAt?: string;
  media?: ReportMedia[];
  confirmationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: ReportCategory | "sustainability" | "community";
  pointsReward: number;
  xpReward: number;
  co2SavedKg: number;
  targetCount: number;
  completedCount: number;
  expiresAt: string;
  badgeIcon: string;
  status: "active" | "completed" | "expired";
}

export interface ImpactStats {
  totalReports: number;
  verifiedReports: number;
  resolvedReports: number;
  resolutionRatePercent: number;
  avgResolutionHours: number;
  totalCitizensActive: number;
  co2ReductionKg: number;
  wasteDivertedKg: number;
  communityPointsAwarded: number;
}

export const CATEGORY_DETAILS: Record<
  ReportCategory,
  { label: string; icon: string; color: string; defaultSeverity: ReportSeverity }
> = {
  pothole: { label: "Pothole & Road Hazard", icon: "road", color: "#ef4444", defaultSeverity: "high" },
  garbage: { label: "Garbage & Waste Accumulation", icon: "trash-2", color: "#f59e0b", defaultSeverity: "medium" },
  streetlight: { label: "Broken Streetlight", icon: "lightbulb", color: "#8b5cf6", defaultSeverity: "low" },
  traffic: { label: "Traffic & Signal Failure", icon: "car", color: "#f97316", defaultSeverity: "high" },
  environmental: { label: "Environmental / Pollution", icon: "leaf", color: "#10b981", defaultSeverity: "medium" },
  water: { label: "Water Leakage & Pipe Burst", icon: "droplets", color: "#06b6d4", defaultSeverity: "medium" },
  infrastructure: { label: "Infrastructure Damage", icon: "building", color: "#6366f1", defaultSeverity: "high" },
  civic: { label: "Civic & Public Amenity", icon: "users", color: "#ec4899", defaultSeverity: "low" },
};

export const SEVERITY_DETAILS: Record<
  ReportSeverity,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  low: { label: "Low Priority", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.12)", borderColor: "rgba(16, 185, 129, 0.3)" },
  medium: { label: "Medium Priority", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.3)" },
  high: { label: "Critical / High", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(239, 68, 68, 0.3)" },
};

export const STATUS_DETAILS: Record<
  ReportStatus,
  { label: string; color: string; bgColor: string; step: number }
> = {
  submitted: { label: "Submitted", color: "#94a3b8", bgColor: "rgba(148, 163, 184, 0.15)", step: 1 },
  under_review: { label: "Under Review", color: "#38bdf8", bgColor: "rgba(56, 189, 248, 0.15)", step: 2 },
  verified: { label: "Verified", color: "#818cf8", bgColor: "rgba(129, 140, 248, 0.15)", step: 3 },
  assigned: { label: "Assigned to Crew", color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.15)", step: 4 },
  in_progress: { label: "In Progress", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.15)", step: 5 },
  resolved: { label: "Resolved", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.15)", step: 6 },
  rejected: { label: "Rejected", color: "#f43f5e", bgColor: "rgba(244, 63, 94, 0.15)", step: 0 },
  duplicate: { label: "Duplicate Marked", color: "#64748b", bgColor: "rgba(100, 116, 139, 0.15)", step: 0 },
};

export const MOCK_REPORTS: ReportSummary[] = [
  {
    id: "rep-001",
    reporterId: "user-101",
    reporterName: "Aarav Sharma",
    category: "pothole",
    severity: "high",
    status: "in_progress",
    description: "Deep pothole near the central junction causing severe vehicle deceleration and safety risks.",
    latitude: 12.9771,
    longitude: 77.5886,
    address: "MG Road & Brigade Rd Junction, Bengaluru",
    assignedTo: "crew-north",
    assignedToName: "Road Maintenance Crew #4",
    confirmationsCount: 14,
    createdAt: "2026-08-14T06:30:00Z",
    updatedAt: "2026-08-14T08:15:00Z",
    verifiedAt: "2026-08-14T07:10:00Z",
  },
  {
    id: "rep-002",
    reporterId: "user-102",
    reporterName: "Priya Patel",
    category: "garbage",
    severity: "medium",
    status: "verified",
    description: "Uncollected municipal waste accumulating beside public park gate for over 3 days.",
    latitude: 12.9764,
    longitude: 77.5951,
    address: "Cubbon Park Gate 3, Kasturba Road",
    confirmationsCount: 8,
    createdAt: "2026-08-14T07:15:00Z",
    updatedAt: "2026-08-14T07:45:00Z",
    verifiedAt: "2026-08-14T07:45:00Z",
  },
  {
    id: "rep-003",
    reporterId: "user-103",
    reporterName: "Bikash Thapa",
    category: "streetlight",
    severity: "low",
    status: "submitted",
    description: "Solar street lamp flickering and cutting out after 9 PM, making pedestrian sidewalk dark.",
    latitude: 12.9716,
    longitude: 77.6021,
    address: "Residency Road 4th Cross",
    confirmationsCount: 3,
    createdAt: "2026-08-14T08:20:00Z",
    updatedAt: "2026-08-14T08:20:00Z",
  },
  {
    id: "rep-004",
    reporterId: "user-104",
    reporterName: "Sita Gurung",
    category: "water",
    severity: "high",
    status: "assigned",
    description: "High-pressure potable water pipeline ruptured underneath footpath, water gushing onto roadway.",
    latitude: 12.9741,
    longitude: 77.5941,
    address: "St. Mark's Road near Metro Station",
    assignedTo: "crew-water-2",
    assignedToName: "Water Works Rapid Response",
    confirmationsCount: 22,
    createdAt: "2026-08-14T05:45:00Z",
    updatedAt: "2026-08-14T07:00:00Z",
    verifiedAt: "2026-08-14T06:15:00Z",
  },
  {
    id: "rep-005",
    reporterId: "user-105",
    reporterName: "Rohan Shrestha",
    category: "environmental",
    severity: "medium",
    status: "resolved",
    description: "Illegal plastic dumping along river canal bank cleaned up and barrier installed.",
    latitude: 12.9698,
    longitude: 77.5871,
    address: "Richmond Town Drainage Canal",
    confirmationsCount: 19,
    createdAt: "2026-08-13T10:00:00Z",
    updatedAt: "2026-08-14T08:00:00Z",
    verifiedAt: "2026-08-13T11:00:00Z",
    resolvedAt: "2026-08-14T08:00:00Z",
  },
  {
    id: "rep-006",
    reporterId: "user-106",
    reporterName: "Ananya Roy",
    category: "traffic",
    severity: "high",
    status: "submitted",
    description: "Traffic light timer loop broken, stuck on red for Northbound lane causing 2km backlog.",
    latitude: 12.9735,
    longitude: 77.6010,
    address: "Mayo Hall Junction",
    confirmationsCount: 31,
    createdAt: "2026-08-14T08:40:00Z",
    updatedAt: "2026-08-14T08:40:00Z",
  }
];

export const MOCK_QUESTS: Quest[] = [
  {
    id: "quest-01",
    title: "Clean Park Community Sweep",
    description: "Join neighborhood volunteers to collect recyclables and clear litter in local public gardens.",
    category: "environmental",
    pointsReward: 150,
    xpReward: 300,
    co2SavedKg: 18.5,
    targetCount: 50,
    completedCount: 34,
    expiresAt: "2026-08-20T23:59:59Z",
    badgeIcon: "leaf",
    status: "active",
  },
  {
    id: "quest-02",
    title: "Neighborhood Light Watch",
    description: "Audit and verify 5 solar streetlights in your ward during evening hours to maintain night safety.",
    category: "streetlight",
    pointsReward: 100,
    xpReward: 200,
    co2SavedKg: 5.2,
    targetCount: 30,
    completedCount: 28,
    expiresAt: "2026-08-18T23:59:59Z",
    badgeIcon: "zap",
    status: "active",
  },
  {
    id: "quest-03",
    title: "Zero Single-Use Plastic Week",
    description: "Document daily reusable bag and bottle usage to reduce urban plastic footprint.",
    category: "sustainability",
    pointsReward: 250,
    xpReward: 500,
    co2SavedKg: 42.0,
    targetCount: 100,
    completedCount: 89,
    expiresAt: "2026-08-25T23:59:59Z",
    badgeIcon: "award",
    status: "active",
  },
];
