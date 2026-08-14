import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import type { MapIssue } from "@/features/map/mockIssues";

type IssueMarkerProps = {
  issue: MapIssue;
  onPress?: () => void;
};

/**
 * Pin + floating label, styled to match the reference design: a colored
 * teardrop marker with a category icon, and a dark label pill showing the
 * title and a severity/quest tag above it.
 */
export function IssueMarker({ issue, onPress }: IssueMarkerProps) {
  return (
    <View style={styles.wrap} onTouchEnd={onPress}>
      <View style={styles.labelPill}>
        <Text style={styles.title}>{issue.title}</Text>
        <Text style={[styles.tag, { color: issue.tagColor }]}>{issue.tag}</Text>
      </View>

      <View style={styles.pinStack}>
        <View style={[styles.pinGlow, { backgroundColor: issue.pinColor }]} />
        <View style={[styles.pin, { backgroundColor: issue.pinColor }]}>
          <MaterialCommunityIcons name={issue.icon} size={18} color={colors.textOnDark} />
        </View>
        <View style={[styles.pinTip, { borderTopColor: issue.pinColor }]} />
      </View>
    </View>
  );
}

const PIN_SIZE = 40;

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  labelPill: {
    backgroundColor: colors.overlayDark,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    alignItems: "flex-start",
  },
  title: {
    color: colors.textOnDark,
    fontWeight: "700",
    fontSize: 13,
  },
  tag: {
    fontWeight: "700",
    fontSize: 12,
    marginTop: 1,
  },
  pinStack: {
    alignItems: "center",
  },
  pinGlow: {
    position: "absolute",
    top: 4,
    width: PIN_SIZE + 14,
    height: PIN_SIZE + 14,
    borderRadius: (PIN_SIZE + 14) / 2,
    opacity: 0.25,
  },
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
});
