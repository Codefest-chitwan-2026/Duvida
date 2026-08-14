import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ProgressRing } from "@/components/ProgressRing";
import type { Quest } from "@/features/quests/mockQuests";
import { colors } from "@/theme/colors";

type QuestDetailScreenProps = {
  quest: Quest;
  onBack?: () => void;
  onStartQuest?: () => void;
};

export function QuestDetailScreen({ quest, onBack, onStartQuest }: QuestDetailScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Quest Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PhotoPlaceholder style={styles.hero} />

        <View style={styles.titleRow}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name={quest.icon} size={18} color={colors.brandGreenDark} />
          </View>
          <Text style={styles.title}>{quest.title}</Text>
        </View>
        <Text style={styles.description}>{quest.description}</Text>

        <View style={styles.statsRow}>
          <StatPill icon="hexagon" iconColor={colors.coinGold} label={`${quest.tokens} tokens`} />
          <StatPill icon="star-four-points" iconColor={colors.brandGreenDark} label={`${quest.xp} XP`} />
          <View style={styles.progressWrap}>
            <ProgressRing percent={quest.progressPercent} size={44} strokeWidth={5} />
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location" size={16} color={colors.brandGreenDark} />
          <Text style={styles.metaText}>{quest.location}</Text>
        </View>

        <Text style={styles.sectionTitle}>Steps</Text>
        <View style={styles.card}>
          {quest.steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepIndex}>
                <Text style={styles.stepIndexText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {quest.safetyNote ? (
          <View style={styles.safetyCard}>
            <Ionicons name="warning" size={18} color={colors.severityHigh} />
            <Text style={styles.safetyText}>{quest.safetyNote}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.startButton} onPress={onStartQuest}>
          <Text style={styles.startButtonText}>Start Quest</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StatPill({
  icon,
  iconColor,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  label: string;
}) {
  return (
    <View style={styles.statPill}>
      <MaterialCommunityIcons name={icon} size={14} color={iconColor} />
      <Text style={styles.statPillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
  hero: { width: "100%", height: 160, borderRadius: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.textPrimary },
  description: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statPillText: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
  progressWrap: { marginLeft: "auto" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: colors.textPrimary, fontWeight: "600" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginTop: 4 },
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  stepIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brandGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndexText: { fontSize: 11, fontWeight: "800", color: colors.textOnDark },
  stepText: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 19 },
  safetyCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.tipsBg,
    borderRadius: 12,
    padding: 12,
    alignItems: "flex-start",
  },
  safetyText: { flex: 1, fontSize: 12, color: colors.textPrimary, lineHeight: 18 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  startButtonText: { color: colors.textOnDark, fontSize: 15, fontWeight: "700" },
});
