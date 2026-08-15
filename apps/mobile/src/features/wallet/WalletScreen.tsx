import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type WalletAction = {
  label: string;
  icon: MaterialIconName;
};

type Summary = {
  label: string;
  value: string;
  icon: MaterialIconName;
  color: string;
};

type Transaction = {
  title: string;
  detail: string;
  amount: string;
  date: string;
  icon: MaterialIconName;
  color: string;
  background: string;
};

const ACTIONS: WalletAction[] = [
  { label: "History", icon: "history" },
  { label: "Send", icon: "send" },
  { label: "Redeem", icon: "gift-outline" },
  { label: "Top Up", icon: "plus-circle-outline" },
];

const SUMMARIES: Summary[] = [
  { label: "Earned", value: "2,250", icon: "arrow-down", color: "#06863C" },
  { label: "Spent", value: "-400", icon: "arrow-up", color: "#EF2727" },
  { label: "Redeemed", value: "12", icon: "gift", color: "#2563EB" },
  { label: "Pending", value: "24", icon: "clock", color: "#9B51D6" },
];

const TRANSACTIONS: Transaction[] = [
  {
    title: "Quest Completed",
    detail: "Clean the Park",
    amount: "+100",
    date: "Today, 10:30 AM",
    icon: "check-bold",
    color: "#069447",
    background: "#DDF5E6",
  },
  {
    title: "Report Verified",
    detail: "Pothole on MG Road",
    amount: "+50",
    date: "Yesterday, 4:15 PM",
    icon: "shield-check",
    color: "#2474DE",
    background: "#E2EDFD",
  },
  {
    title: "Quest Completed",
    detail: "Tree Plantation Challenge",
    amount: "+120",
    date: "2 days ago",
    icon: "check-bold",
    color: "#069447",
    background: "#DDF5E6",
  },
  {
    title: "Voucher Redeemed",
    detail: "Amazon Gift Card",
    amount: "-300",
    date: "3 days ago",
    icon: "gift",
    color: "#F97316",
    background: "#FFF0DC",
  },
  {
    title: "Top Up",
    detail: "Purchased 1,000 Vouchers",
    amount: "+1,000",
    date: "5 days ago",
    icon: "plus",
    color: "#9452D3",
    background: "#EFE2FC",
  },
];

const cardShadow = {
  shadowColor: "#15321F",
  shadowOpacity: 0.09,
  shadowRadius: 13,
  shadowOffset: { width: 0, height: 5 },
  elevation: 4,
};

export function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, `${feature} will be available soon.`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 130 },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Back to map"
            hitSlop={10}
            onPress={() => router.navigate("/")}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={29} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Voucher Wallet</Text>
          <Pressable
            accessibilityLabel="Voucher wallet help"
            hitSlop={10}
            onPress={() => showComingSoon("Voucher wallet help")}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          >
            <Ionicons name="help-circle-outline" size={30} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.balanceRow}>
            <View style={styles.balanceCopy}>
              <Text style={styles.balanceLabel}>My Balance</Text>
              <View style={styles.balanceValueRow}>
                <Coin size={48} />
                <Text style={styles.balanceValue}>2,450</Text>
              </View>
              <Text style={styles.balanceUnit}>Everest Vouchers</Text>
            </View>
            <WalletIllustration />
          </View>

          <View style={styles.actionsRow}>
            {ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                onPress={() => showComingSoon(action.label)}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
              >
                <MaterialCommunityIcons
                  name={action.icon}
                  size={34}
                  color="#0DC45A"
                />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          {SUMMARIES.map((summary, index) => (
            <View
              key={summary.label}
              style={[styles.summaryItem, index > 0 && styles.summaryDivider]}
            >
              <View style={styles.summaryValueRow}>
                <MaterialCommunityIcons name={summary.icon} size={23} color={summary.color} />
                <Text style={styles.summaryValue}>{summary.value}</Text>
              </View>
              <Text style={styles.summaryLabel}>{summary.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Pressable onPress={() => showComingSoon("Transaction history")} hitSlop={8}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        <View style={styles.transactionsCard}>
          {TRANSACTIONS.map((transaction, index) => (
            <TransactionRow
              key={`${transaction.title}-${transaction.date}`}
              transaction={transaction}
              showDivider={index > 0}
            />
          ))}
        </View>

        <View style={styles.earnBanner}>
          <View style={styles.earnIcon}>
            <MaterialCommunityIcons name="shield-star" size={35} color="#F6C439" />
            <Ionicons name="leaf" size={17} color="#D8F9B7" style={styles.earnLeaf} />
          </View>
          <View style={styles.earnCopy}>
            <Text style={styles.earnTitle}>Earn more vouchers!</Text>
            <Text style={styles.earnText}>
              Complete quests, verify reports, and take sustainability challenges to earn
              vouchers.
            </Text>
          </View>
          <Pressable
            onPress={() => router.navigate("/quests")}
            style={({ pressed }) => [styles.exploreButton, pressed && styles.pressed]}
          >
            <Text style={styles.exploreText}>Explore Quests</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.card} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Coin({ size }: { size: number }) {
  return (
    <View
      style={[
        styles.coin,
        { width: size, height: size, borderRadius: size / 2, borderWidth: Math.max(2, size / 14) },
      ]}
    >
      <Ionicons name="leaf" size={size * 0.48} color="#FFF3A5" />
    </View>
  );
}

function WalletIllustration() {
  return (
    <View style={styles.walletArt} pointerEvents="none">
      <View style={styles.walletBackCard} />
      <View style={styles.walletBody}>
        <View style={styles.walletStitch} />
        <View style={styles.walletClasp}>
          <View style={styles.walletButton} />
        </View>
      </View>
      <View style={styles.artCoinTop}>
        <Coin size={46} />
      </View>
      <View style={styles.artCoinRight}>
        <Coin size={55} />
      </View>
      <View style={styles.artCoinFront}>
        <Coin size={48} />
      </View>
      <Ionicons name="leaf" size={27} color="#65A30D" style={styles.artLeafLeft} />
      <Ionicons name="leaf" size={24} color="#4D9B0A" style={styles.artLeafRight} />
    </View>
  );
}

function TransactionRow({
  transaction,
  showDivider,
}: {
  transaction: Transaction;
  showDivider: boolean;
}) {
  const amountColor = transaction.amount.startsWith("-") ? "#E51F1F" : "#07883C";

  return (
    <View style={[styles.transactionRow, showDivider && styles.transactionDivider]}>
      <View style={[styles.transactionIcon, { backgroundColor: transaction.background }]}>
        <View style={[styles.transactionIconInner, { backgroundColor: transaction.color }]}>
          <MaterialCommunityIcons name={transaction.icon} size={20} color={colors.card} />
        </View>
      </View>
      <View style={styles.transactionCopy}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionDetail} numberOfLines={1}>
          {transaction.detail}
        </Text>
      </View>
      <View style={styles.transactionMeta}>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>{transaction.amount}</Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.58,
  },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  heroCard: {
    minHeight: 328,
    overflow: "hidden",
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#004331",
    ...cardShadow,
  },
  heroGlow: {
    position: "absolute",
    top: -100,
    right: -30,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(9, 106, 70, 0.52)",
  },
  balanceRow: {
    minHeight: 180,
    flexDirection: "row",
  },
  balanceCopy: {
    flex: 1,
    zIndex: 2,
    paddingTop: 8,
    paddingLeft: 4,
  },
  balanceLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#B7C8C4",
  },
  balanceValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  balanceValue: {
    fontSize: 40,
    lineHeight: 47,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: colors.card,
  },
  balanceUnit: {
    marginTop: 4,
    marginLeft: 60,
    fontSize: 15,
    fontWeight: "600",
    color: colors.card,
  },
  coin: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFB700",
    borderColor: "#FFD658",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  walletArt: {
    width: 170,
    height: 177,
  },
  walletBackCard: {
    position: "absolute",
    right: 8,
    bottom: 35,
    width: 126,
    height: 91,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#466E42",
    backgroundColor: "#173E2B",
    transform: [{ rotate: "-5deg" }],
  },
  walletBody: {
    position: "absolute",
    right: 2,
    bottom: 18,
    width: 145,
    height: 91,
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#5D8245",
    backgroundColor: "#16452F",
  },
  walletStitch: {
    position: "absolute",
    left: 9,
    right: 9,
    top: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#C5A643",
  },
  walletClasp: {
    position: "absolute",
    right: -3,
    top: 33,
    width: 49,
    height: 29,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#517B3B",
    backgroundColor: "#0D3425",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 7,
  },
  walletButton: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#E5D8A5",
    backgroundColor: "#9B8A55",
  },
  artCoinTop: {
    position: "absolute",
    top: 1,
    left: 42,
  },
  artCoinRight: {
    position: "absolute",
    top: 42,
    right: 24,
  },
  artCoinFront: {
    position: "absolute",
    left: 20,
    bottom: 8,
  },
  artLeafLeft: {
    position: "absolute",
    top: 55,
    left: 0,
    transform: [{ rotate: "-45deg" }],
  },
  artLeafRight: {
    position: "absolute",
    top: 15,
    right: 2,
    transform: [{ rotate: "34deg" }],
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
    height: 108,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.025)",
  },
  actionPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.card,
  },
  summaryCard: {
    minHeight: 108,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF1EE",
    backgroundColor: colors.card,
    ...cardShadow,
  },
  summaryItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 4,
  },
  summaryDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  summaryValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#526078",
  },
  sectionHeader: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "800",
    color: "#07883C",
  },
  transactionsCard: {
    overflow: "hidden",
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E1E7E2",
    backgroundColor: colors.card,
  },
  transactionRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  transactionDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  transactionIcon: {
    width: 49,
    height: 49,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionIconInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionCopy: {
    flex: 1,
    minWidth: 0,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  transactionDetail: {
    marginTop: 4,
    fontSize: 12,
    color: "#526078",
  },
  transactionMeta: {
    alignItems: "flex-end",
    paddingLeft: 3,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "800",
  },
  transactionDate: {
    marginTop: 6,
    fontSize: 11,
    color: "#526078",
  },
  earnBanner: {
    marginTop: 14,
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#E7F6ED",
  },
  earnIcon: {
    width: 55,
    height: 62,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C7139",
    borderWidth: 3,
    borderColor: "#A9D68A",
  },
  earnLeaf: {
    position: "absolute",
  },
  earnCopy: {
    flex: 1,
    minWidth: 0,
  },
  earnTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  earnText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
    color: "#526078",
  },
  exploreButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: "#03913F",
  },
  exploreText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.card,
  },
});
