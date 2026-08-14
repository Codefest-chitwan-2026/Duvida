import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { badges, leaderboard, rewardsSummary } from "@/features/rewards/mockRewards";
import { colors } from "@/theme/colors";

type RewardsScreenProps = {
  onViewWallet?: () => void;
};

export function RewardsScreen({ onViewWallet }: RewardsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Rewards</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 132 }]}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{rewardsSummary.totalPoints.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Points</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{rewardsSummary.xp.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>XP</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>Lv {rewardsSummary.level}</Text>
            <Text style={styles.summaryLabel}>Level</Text>
          </View>
        </View>

        <Pressable style={styles.walletLink} onPress={onViewWallet}>
          <View style={styles.walletLinkIcon}>
            <Ionicons name="wallet" size={18} color={colors.brandGreenDark} />
          </View>
          <View style={styles.walletLinkText}>
            <Text style={styles.walletLinkTitle}>View Wallet</Text>
            <Text style={styles.walletLinkSubtitle}>Balance & transaction history</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Text style={styles.sectionTitle}>Badges & Achievements</Text>
        <View style={styles.badgeRow}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badge}>
              <MaterialCommunityIcons name={badge.icon} size={22} color={colors.brandGreenDark} />
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <View style={styles.card}>
          {leaderboard.map((entry) => (
            <View key={entry.id} style={styles.leaderboardRow}>
              <Text style={styles.leaderboardRank}>#{entry.rank}</Text>
              <Text style={[styles.leaderboardName, entry.name === "You" && styles.leaderboardNameSelf]}>
                {entry.name}
              </Text>
              <Text style={styles.leaderboardPoints}>{entry.points.toLocaleString()} pts</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: colors.textPrimary },
  content: { paddingHorizontal: 16, gap: 16 },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    paddingVertical: 18,
  },
  summaryStat: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  summaryLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  summaryDivider: { width: 1, height: 32, backgroundColor: colors.border },
  walletLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
  },
  walletLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  walletLinkText: { flex: 1 },
  walletLinkTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  walletLinkSubtitle: { fontSize: 12, color: colors.textMuted },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 10,
  },
  badgeLabel: { fontSize: 12, fontWeight: "600", color: colors.textPrimary, flexShrink: 1 },
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  leaderboardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  leaderboardRank: { width: 28, fontSize: 13, fontWeight: "800", color: colors.textMuted },
  leaderboardName: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  leaderboardNameSelf: { color: colors.brandGreenDark, fontWeight: "800" },
  leaderboardPoints: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
});
