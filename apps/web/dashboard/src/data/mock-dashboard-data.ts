// Development-only mock data. Replace with Supabase data before production.
//
// This file is the single source of realistic-but-fictional municipal data
// used to preview the Municipal Authority Dashboard UI. Nothing here is
// written to Supabase, and no real citizen data is represented.

import type { DashboardData } from "@/lib/data/types";

export const MOCK_ORGANIZATION_NAME = "Municipal Authority";

export const MOCK_DASHBOARD_DATA: DashboardData = {
  organizationName: MOCK_ORGANIZATION_NAME,

  summary: {
    totalReports: { label: "Total Reports", value: 1284, changePercent: 12.5, changeDirection: "up" },
    verifiedReports: { label: "Verified Reports", value: 1102, changePercent: 9.3, changeDirection: "up" },
    pendingReview: { label: "Pending Review", value: 182, changePercent: 4.8, changeDirection: "down" },
    activeUsers: { label: "Active Users", value: 2148, changePercent: 15.7, changeDirection: "up" },
    questsCompleted: { label: "Quests Completed", value: 360, changePercent: 18.2, changeDirection: "up" },
  },

  categoryBreakdown: [
    { category: "Waste & Recycling", count: 412, percent: 32.1, color: "#16794f" },
    { category: "Road & Infrastructure", count: 331, percent: 25.8, color: "#1d4ed8" },
    { category: "Water Supply", count: 214, percent: 16.7, color: "#0891b2" },
    { category: "Streetlight & Energy", count: 158, percent: 12.3, color: "#b45309" },
    { category: "Greenery & Biodiversity", count: 109, percent: 8.5, color: "#6d28d9" },
    { category: "Community Action", count: 60, percent: 4.6, color: "#64748b" },
  ],

  reportsTrend: {
    points: [
      { label: "Mon", currentPeriod: 168, previousPeriod: 132 },
      { label: "Tue", currentPeriod: 182, previousPeriod: 150 },
      { label: "Wed", currentPeriod: 149, previousPeriod: 138 },
      { label: "Thu", currentPeriod: 201, previousPeriod: 162 },
      { label: "Fri", currentPeriod: 224, previousPeriod: 179 },
      { label: "Sat", currentPeriod: 196, previousPeriod: 171 },
      { label: "Sun", currentPeriod: 164, previousPeriod: 149 },
    ],
  },

  recentReports: [
    {
      id: "RPT-2041",
      title: "Waste accumulation near community market",
      category: "Waste & Recycling",
      ward: "Ward 3",
      location: "Community Market Road, Ward 3",
      reportedAgo: "10 min ago",
      severity: "high",
      status: "pending_review",
    },
    {
      id: "RPT-2040",
      title: "Water leakage on municipal road",
      category: "Water Supply",
      ward: "Ward 2",
      location: "Municipal Road, Ward 2",
      reportedAgo: "25 min ago",
      severity: "medium",
      status: "verified",
    },
    {
      id: "RPT-2039",
      title: "Streetlight not working",
      category: "Streetlight & Energy",
      ward: "Ward 1",
      location: "Sector 4 Crossing, Ward 1",
      reportedAgo: "1 hr ago",
      severity: "medium",
      status: "in_progress",
    },
    {
      id: "RPT-2038",
      title: "Damaged public footpath",
      category: "Road & Infrastructure",
      ward: "Ward 4",
      location: "Riverside Walkway, Ward 4",
      reportedAgo: "2 hr ago",
      severity: "low",
      status: "resolved",
    },
    {
      id: "RPT-2037",
      title: "Illegal dumping near public area",
      category: "Waste & Recycling",
      ward: "Ward 5",
      location: "Public Park Entrance, Ward 5",
      reportedAgo: "3 hr ago",
      severity: "high",
      status: "rejected",
    },
  ],

  topReporters: [
    { rank: 1, name: "Aarav Sharma", reportsSubmitted: 48, participationScore: 2450 },
    { rank: 2, name: "Maya Rai", reportsSubmitted: 32, participationScore: 1980 },
    { rank: 3, name: "Rohan Gurung", reportsSubmitted: 28, participationScore: 1650 },
    { rank: 4, name: "Sita Thapa", reportsSubmitted: 24, participationScore: 1420 },
    { rank: 5, name: "Binayak G.C.", reportsSubmitted: 20, participationScore: 1150 },
  ],

  statusBreakdown: [
    { status: "verified", label: "Verified", count: 1102, percent: 85.9, color: "#16794f" },
    { status: "pending_review", label: "Pending Review", count: 182, percent: 14.2, color: "#b45309" },
    { status: "in_progress", label: "In Progress", count: 96, percent: 7.5, color: "#1d4ed8" },
    { status: "resolved", label: "Resolved", count: 451, percent: 35.1, color: "#6d28d9" },
    { status: "rejected", label: "Rejected", count: 34, percent: 2.6, color: "#b91c1c" },
  ],

  recentActivities: [
    { id: "act-1", actor: "Verification Officer S. Karki", action: "verified Report #RPT-2038 (Damaged public footpath)", ago: "15 min ago" },
    { id: "act-2", actor: "Ward Officer, Ward 3", action: "created community quest \"Clean Your Neighborhood\"", ago: "1 hr ago" },
    { id: "act-3", actor: "Citizen Reporter", action: "submitted resolution evidence for Report #RPT-2030", ago: "2 hr ago" },
    { id: "act-4", actor: "Ward Officer, Ward 2", action: "reviewed Report #RPT-2035", ago: "3 hr ago" },
  ],

  todaySummary: [
    { label: "Reports Submitted", value: 48, sparkline: [4, 7, 5, 9, 8, 11, 4] },
    { label: "Reports Verified", value: 36, sparkline: [3, 5, 4, 6, 7, 8, 3] },
    { label: "Quests Completed", value: 27, sparkline: [2, 3, 5, 4, 6, 5, 2] },
    { label: "Impact Incentives Distributed", value: 1850, sparkline: [120, 240, 180, 320, 410, 380, 200] },
  ],

  impactSummary: [
    { label: "Trees Planted", value: 1245, changeLabel: "+120 this week" },
    { label: "Cleanups Completed", value: 32, changeLabel: "+4 this week" },
  ],

  filters: {
    wards: ["Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5"],
    statuses: [
      { value: "pending_review", label: "Pending Review" },
      { value: "verified", label: "Verified" },
      { value: "in_progress", label: "In Progress" },
      { value: "resolved", label: "Resolved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
};
