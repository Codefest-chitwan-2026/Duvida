import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { rewardsSummary, transactions } from "@/features/rewards/mockRewards";
import { colors } from "@/theme/colors";

type WalletScreenProps = {
  onBack?: () => void;
};

export function WalletScreen({ onBack }: WalletScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <MaterialCommunityIcons name="hexagon" size={22} color={colors.coinGold} />
          <Text style={styles.balanceValue}>{rewardsSummary.totalPoints.toLocaleString()}</Text>
          <Text style={styles.balanceLabel}>Current balance</Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.card}>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txIcon}>
                <Ionicons name="add-circle" size={18} color={colors.brandGreen} />
              </View>
              <View style={styles.txTextWrap}>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={styles.txAmount}>+{tx.amount}</Text>
            </View>
          ))}
        </View>
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
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  balanceCard: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    paddingVertical: 24,
    gap: 4,
  },
  balanceValue: { fontSize: 26, fontWeight: "800", color: colors.textPrimary, marginTop: 4 },
  balanceLabel: { fontSize: 12, color: colors.textMuted },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  card: { backgroundColor: colors.surfaceMuted, borderRadius: 14, padding: 14, gap: 14 },
  txRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  txIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  txTextWrap: { flex: 1 },
  txLabel: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  txDate: { fontSize: 11, color: colors.textMuted },
  txAmount: { fontSize: 13, fontWeight: "800", color: colors.brandGreenDark },
});
