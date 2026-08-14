import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { rewardsSummary } from "@/features/rewards/mockRewards";
import { colors } from "@/theme/colors";

const IMPACT_STATS = [
  { icon: "leaf" as const, label: "Estimated CO₂ saved", value: "38 kg" },
  { icon: "recycle" as const, label: "Waste diverted from landfill", value: "12 kg" },
  { icon: "water" as const, label: "Water saved", value: "220 L" },
];

export default function ImpactRoute() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Your Impact</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          A rough estimate of your positive impact from {rewardsSummary.questsCompleted} completed quests
          and {rewardsSummary.reportsSubmitted} reports submitted.
        </Text>

        {IMPACT_STATS.map((stat) => (
          <View key={stat.label} style={styles.card}>
            <View style={styles.iconBadge}>
              <MaterialCommunityIcons name={stat.icon} size={20} color={colors.brandGreenDark} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardValue}>{stat.value}</Text>
              <Text style={styles.cardLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  subtitle: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1 },
  cardValue: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  cardLabel: { fontSize: 12, color: colors.textMuted },
});
