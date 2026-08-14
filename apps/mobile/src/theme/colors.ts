export const colors = {
  background: "#0B1220",
  overlayDark: "rgba(17, 24, 39, 0.85)",
  card: "#FFFFFF",

  textPrimary: "#111827",
  textOnDark: "#FFFFFF",
  textMuted: "#6B7280",

  brandGreen: "#22C55E",
  brandGreenDark: "#16A34A",
  teal: "#22D3EE",

  severityHigh: "#EF4444",
  severityMedium: "#F59E0B",
  severityLow: "#22C55E",
  quest: "#22C55E",

  pinRed: "#EF4444",
  pinAmber: "#F5A524",
  pinPurple: "#8B5CF6",
  pinBlue: "#3B82F6",
  pinGreen: "#22C55E",

  coinGold: "#F5B301",

  border: "#E5E7EB",
  surfaceMuted: "#F9FAFB",
  progressTrack: "#E5E7EB",
  infoBg: "#EAF7EE",
  infoIconBg: "#DCFCE7",
  tipsBg: "#EFF6FF",
  tipsBlue: "#2563EB",
} as const;

export type AppColors = typeof colors;
