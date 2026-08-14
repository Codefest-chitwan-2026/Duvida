import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ProgressRing } from "@/components/ProgressRing";
import { mockQuests, type Quest, type QuestCategory, type QuestStatus } from "@/features/quests/mockQuests";
import { colors } from "@/theme/colors";

const CATEGORY_FILTERS: { key: QuestCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "community", label: "Community" },
  { key: "personal", label: "Personal" },
];

const STATUS_FILTERS: { key: QuestStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "expired", label: "Expired" },
];

export default function QuestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [category, setCategory] = useState<QuestCategory | "all">("all");
  const [status, setStatus] = useState<QuestStatus>("active");

  const filteredQuests = useMemo(
    () =>
      mockQuests.filter(
        (quest) => (category === "all" || quest.category === category) && quest.status === status
      ),
    [category, status]
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Quests</Text>
          <Pressable
            style={styles.advisorButton}
            onPress={() => router.push("/quests/advisor")}
            hitSlop={8}
          >
            <Ionicons name="sparkles" size={14} color={colors.brandGreenDark} />
            <Text style={styles.advisorButtonText}>AI Advisor</Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {CATEGORY_FILTERS.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              active={category === filter.key}
              onPress={() => setCategory(filter.key)}
            />
          ))}
        </View>
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              active={status === filter.key}
              onPress={() => setStatus(filter.key)}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 132 }]}>
        {filteredQuests.length === 0 ? (
          <Text style={styles.emptyText}>No {status} quests here yet.</Text>
        ) : (
          filteredQuests.map((quest) => <QuestCard key={quest.id} quest={quest} />)
        )}
      </ScrollView>
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: "/quests/[id]", params: { id: quest.id } })}
    >
      <PhotoPlaceholder style={styles.thumb} />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name={quest.icon} size={14} color={colors.brandGreenDark} />
          </View>
          <Text style={styles.title}>{quest.title}</Text>
        </View>
        <Text style={styles.description}>{quest.description}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="hexagon" size={13} color={colors.coinGold} />
            <Text style={styles.statValue}>{quest.tokens}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people" size={13} color={colors.textMuted} />
            <Text style={styles.statValue}>{quest.participants}</Text>
          </View>
        </View>
      </View>
      <ProgressRing percent={quest.progressPercent} size={48} strokeWidth={5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.card,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  advisorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.infoIconBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  advisorButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandGreenDark,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  chipActive: {
    backgroundColor: colors.brandGreen,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.textOnDark,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 24,
    fontSize: 13,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  description: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
