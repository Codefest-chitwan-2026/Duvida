import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import type { MapIssue } from "@/features/map/mockIssues";

type IssueDetailScreenProps = {
  issue: MapIssue;
  onBack?: () => void;
  onReportSimilar?: () => void;
};

export function IssueDetailScreen({ issue, onBack, onReportSimilar }: IssueDetailScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Details</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.body}>
        <View style={[styles.iconBadge, { backgroundColor: issue.pinColor }]}>
          <MaterialCommunityIcons name={issue.icon} size={32} color={colors.textOnDark} />
        </View>

        <Text style={styles.title}>{issue.title}</Text>
        <View style={[styles.tag, { backgroundColor: issue.tagColor }]}>
          <Text style={styles.tagText}>{issue.tag} severity</Text>
        </View>

        <View style={styles.card}>
          <DetailRow icon="location-outline" label="Location" value="Near your current area" />
          <DetailRow
            icon="document-text-outline"
            label="Description"
            value="Reported by a community member. Full report details (photos, description, timeline) will appear here once issue records are backed by Supabase."
          />
          <DetailRow icon="time-outline" label="Status" value="Open — awaiting verification" />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onReportSimilar} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Report a Similar Issue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.detailIcon} />
      <View style={styles.detailTextWrap}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  body: { flex: 1, paddingHorizontal: 20, alignItems: "center" },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, marginTop: 16 },
  tag: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: { fontSize: 12, fontWeight: "700", color: colors.textOnDark },
  card: {
    width: "100%",
    marginTop: 24,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  detailRow: { flexDirection: "row", gap: 10 },
  detailIcon: { marginTop: 2 },
  detailTextWrap: { flex: 1 },
  detailLabel: { fontSize: 12, fontWeight: "700", color: colors.textMuted, marginBottom: 2 },
  detailValue: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  primaryButton: {
    marginTop: 28,
    width: "100%",
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.textOnDark, fontSize: 15, fontWeight: "700" },
});
