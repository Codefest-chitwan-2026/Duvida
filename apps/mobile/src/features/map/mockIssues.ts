import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

export type IssueKind = "issue" | "quest";
export type MapIssueIcon = keyof typeof MaterialCommunityIcons.glyphMap;

export type MapIssue = {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  pinColor: string;
  icon: MapIssueIcon;
  kind: IssueKind;
  /** Offset in degrees from the map center, roughly matching the reference layout. */
  offset: { lat: number; lng: number };
};

export const DEMO_CENTER = {
  latitude: 12.9716,
  longitude: 77.5946,
};

export const mockIssues: MapIssue[] = [
  {
    id: "pothole",
    title: "Pothole",
    tag: "High",
    tagColor: colors.severityHigh,
    pinColor: colors.pinRed,
    icon: "road-variant",
    kind: "issue",
    offset: { lat: 0.0055, lng: -0.006 },
  },
  {
    id: "garbage",
    title: "Garbage",
    tag: "Medium",
    tagColor: colors.severityMedium,
    pinColor: colors.pinAmber,
    icon: "delete",
    kind: "issue",
    offset: { lat: 0.0048, lng: 0.0005 },
  },
  {
    id: "street-light",
    title: "Street Light",
    tag: "Low",
    tagColor: colors.severityLow,
    pinColor: colors.pinPurple,
    icon: "lightbulb-on-outline",
    kind: "issue",
    offset: { lat: 0.0055, lng: 0.0075 },
  },
  {
    id: "water-leak",
    title: "Water Leak",
    tag: "Medium",
    tagColor: colors.severityMedium,
    pinColor: colors.pinBlue,
    icon: "water",
    kind: "issue",
    offset: { lat: 0.0025, lng: -0.0005 },
  },
  {
    id: "traffic",
    title: "Traffic",
    tag: "High",
    tagColor: colors.severityHigh,
    pinColor: colors.pinRed,
    icon: "car",
    kind: "issue",
    offset: { lat: 0.0025, lng: 0.0075 },
  },
  {
    id: "clean-park",
    title: "Clean Park",
    tag: "Quest",
    tagColor: colors.quest,
    pinColor: colors.pinGreen,
    icon: "leaf",
    kind: "quest",
    offset: { lat: 0.0012, lng: -0.0075 },
  },
  {
    id: "plastic-free",
    title: "Plastic Free",
    tag: "Quest",
    tagColor: colors.quest,
    pinColor: colors.pinPurple,
    icon: "trophy",
    kind: "quest",
    offset: { lat: 0.0005, lng: 0.0072 },
  },
];
