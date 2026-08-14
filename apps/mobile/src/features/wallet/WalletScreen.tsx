import { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

type IconName = keyof typeof Ionicons.glyphMap;

type WalletAction = {
  label: string;
  icon: IconName;
  key: "history" | "send" | "redeem" | "top-up";
};

type WalletStat = {
  label: string;
  value: string;
  icon: IconName;
  color: string;
};

type Transaction = {
  id: string;
  title: string;
  detail: string;
  amount: string;
  date: string;
  icon: IconName;
  color: string;
  background: string;
  positive: boolean;
};

const ACTIONS: WalletAction[] = [
  { key: "history", label: "History", icon: "time-outline" },
  { key: "send", label: "Send", icon: "paper-plane-outline" },
  { key: "redeem", label: "Redeem", icon: "gift-outline" },
  { key: "top-up", label: "Top Up", icon: "add-circle-outline" },
];

const STATS: WalletStat[] = [
  { label: "Earned", value: "2,250", icon: "arrow-down", color: "#079447" },
  { label: "Spent", value: "-400", icon: "arrow-up", color: "#DC2626" },
  { label: "Redeemed", value: "12", icon: "gift", color: "#2563EB" },
  { label: "Pending", value: "24", icon: "time", color: "#8B5CF6" },
];

const TRANSACTIONS: Transaction[] = [
  {
    id: "clean-park",
    title: "Quest Completed",
    detail: "Clean the Park",
    amount: "+100",
    date: "Today, 10:30 AM",
    icon: "checkmark",
    color: "#079447",
    background: "#DCFCE7",
    positive: true,
  },
  {
    id: "report-verified",
    title: "Report Verified",
    detail: "Pothole on MG Road",
    amount: "+50",
    date: "Yesterday, 4:15 PM",
    icon: "shield-checkmark",
    color: "#2563EB",
    background: "#DBEAFE",
    positive: true,
  },
  {
    id: "tree-plantation",
    title: "Quest Completed",
    detail: "Tree Plantation Challenge",
    amount: "+120",
    date: "2 days ago",
    icon: "checkmark",
    color: "#079447",
    background: "#DCFCE7",
    positive: true,
  },
  {
    id: "gift-card",
    title: "Token Redeemed",
    detail: "Community Store Voucher",
    amount: "-300",
    date: "3 days ago",
    icon: "gift",
    color: "#EA580C",
    background: "#FFEDD5",
    positive: false,
  },
  {
    id: "top-up",
    title: "Top Up",
    detail: "Purchased 1,000 Tokens",
    amount: "+1,000",
    date: "5 days ago",
    icon: "add",
    color: "#8B5CF6",
    background: "#F3E8FF",
    positive: true,
  },
];

export function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const transactionOffset = useRef(0);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const compact = width < 370;

  const handleAction = (action: WalletAction["key"]) => {
    if (action === "history") {
      setShowAllTransactions(true);
      scrollRef.current?.scrollTo({ y: transactionOffset.current, animated: true });
      return;
    }

    const messages = {
      send: "Secure token transfers will be available once wallet verification is connected.",
      redeem: "The rewards marketplace is being prepared for your community.",
      "top-up": "Token top-ups will be available after payment setup is complete.",
    } as const;

    Alert.alert(action === "top-up" ? "Top Up" : action[0].toUpperCase() + action.slice(1), messages[action]);
  };

  const visibleTransactions = showAllTransactions ? TRANSACTIONS : TRANSACTIONS.slice(0, 3);

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 128 },
        ]}
      >
        <View style={styles.pageContent}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Back to map"
              hitSlop={10}
              onPress={() => router.navigate("/")}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Token Wallet</Text>
            <Pressable
              accessibilityLabel="Wallet help"
              hitSlop={10}
              onPress={() =>
                Alert.alert(
                  "Everest Tokens",
                  "Earn tokens by completing quests and submitting verified community reports. Redeem them for community rewards."
                )
              }
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <Ionicons name="help-circle-outline" size={27} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={[styles.balanceCard, compact && styles.balanceCardCompact]}>
            <View style={styles.balanceGlow} />
            <View style={styles.walletArtwork} pointerEvents="none">
              <View style={[styles.decorativeCoin, styles.coinOne]}>
                <Ionicons name="leaf" size={18} color="#FFF2A8" />
              </View>
              <View style={[styles.decorativeCoin, styles.coinTwo]}>
                <Ionicons name="leaf" size={14} color="#FFF2A8" />
              </View>
              <MaterialCommunityIcons
                name="wallet"
                size={compact ? 104 : 132}
                color="rgba(17, 132, 68, 0.55)"
              />
            </View>

            <View style={styles.balanceCopy}>
              <Text style={styles.balanceLabel}>My Balance</Text>
              <View style={styles.balanceRow}>
                <View style={styles.tokenCoin}>
                  <Ionicons name="leaf" size={22} color="#FFF5B7" />
                </View>
                <Text style={[styles.balanceValue, compact && styles.balanceValueCompact]}>
                  2,450
                </Text>
              </View>
              <Text style={styles.balanceUnit}>Everest Tokens</Text>
            </View>

            <View style={styles.actionRow}>
              {ACTIONS.map((action) => (
                <ActionButton
                  key={action.key}
                  action={action}
                  compact={compact}
                  onPress={() => handleAction(action.key)}
                />
              ))}
            </View>
          </View>

          <View style={[styles.card, styles.statsCard]}>
            {STATS.map((stat, index) => (
              <View key={stat.label} style={[styles.stat, index > 0 && styles.statDivider]}>
                <View style={styles.statValueRow}>
                  <Ionicons name={stat.icon} size={compact ? 18 : 21} color={stat.color} />
                  <Text style={[styles.statValue, compact && styles.statValueCompact]}>
                    {stat.value}
                  </Text>
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View
            style={styles.transactionsSection}
            onLayout={(event) => {
              transactionOffset.current = event.nativeEvent.layout.y;
            }}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <Pressable
                hitSlop={8}
                onPress={() => setShowAllTransactions((current) => !current)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.viewAll}>{showAllTransactions ? "View Less" : "View All"}</Text>
              </Pressable>
            </View>

            <View style={[styles.card, styles.transactionCard]}>
              {visibleTransactions.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  divided={index > 0}
                />
              ))}
            </View>
          </View>

          <View style={styles.earnCard}>
            <View style={styles.earnIcon}>
              <Ionicons name="leaf" size={28} color={colors.card} />
            </View>
            <View style={styles.earnCopy}>
              <Text style={styles.earnTitle}>Earn more tokens!</Text>
              <Text style={styles.earnText}>
                Complete quests, verify reports, and take sustainability challenges.
              </Text>
            </View>
            <Pressable
              onPress={() => router.navigate("/quests")}
              style={({ pressed }) => [
                styles.exploreButton,
                compact && styles.exploreButtonCompact,
                pressed && styles.exploreButtonPressed,
              ]}
            >
              <Text style={styles.exploreButtonText}>{compact ? "Explore" : "Explore Quests"}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.card} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ActionButton({
  action,
  compact,
  onPress,
}: {
  action: WalletAction;
  compact: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        compact && styles.actionButtonCompact,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <Ionicons name={action.icon} size={compact ? 24 : 29} color="#18C462" />
      <Text style={[styles.actionLabel, compact && styles.actionLabelCompact]}>{action.label}</Text>
    </Pressable>
  );
}

function TransactionRow({
  transaction,
  divided,
}: {
  transaction: Transaction;
  divided: boolean;
}) {
  return (
    <Pressable
      onPress={() =>
        Alert.alert(
          transaction.title,
          `${transaction.detail}\n${transaction.amount} Everest Tokens\n${transaction.date}`
        )
      }
      style={({ pressed }) => [
        styles.transactionRow,
        divided && styles.transactionDivider,
        pressed && styles.transactionPressed,
      ]}
    >
      <View style={[styles.transactionIcon, { backgroundColor: transaction.background }]}>
        <Ionicons name={transaction.icon} size={22} color={transaction.color} />
      </View>
      <View style={styles.transactionCopy}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionDetail} numberOfLines={1}>
          {transaction.detail}
        </Text>
      </View>
      <View style={styles.transactionMeta}>
        <Text
          style={[
            styles.transactionAmount,
            { color: transaction.positive ? "#079447" : colors.severityHigh },
          ]}
        >
          {transaction.amount}
        </Text>
        <Text style={styles.transactionDate}>{transaction.date}</Text>
      </View>
    </Pressable>
  );
}

const cardShadow = {
  shadowColor: "#183728",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 5 },
  elevation: 3,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
  },
  pageContent: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    gap: 15,
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.58,
  },
  balanceCard: {
    minHeight: 348,
    padding: 24,
    paddingBottom: 112,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#063E2E",
  },
  balanceCardCompact: {
    minHeight: 328,
    paddingHorizontal: 18,
  },
  balanceGlow: {
    position: "absolute",
    top: -110,
    right: -70,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(21, 128, 61, 0.18)",
  },
  walletArtwork: {
    position: "absolute",
    top: 40,
    right: 18,
    width: 170,
    height: 155,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  decorativeCoin: {
    position: "absolute",
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFE066",
    backgroundColor: "#F5B301",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  coinOne: {
    top: 0,
    left: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  coinTwo: {
    top: 39,
    right: 5,
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  balanceCopy: {
    zIndex: 3,
    alignSelf: "flex-start",
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.68)",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 13,
  },
  tokenCoin: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFE066",
    backgroundColor: "#F5B301",
  },
  balanceValue: {
    fontSize: 47,
    lineHeight: 54,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: colors.card,
  },
  balanceValueCompact: {
    fontSize: 39,
  },
  balanceUnit: {
    marginTop: 5,
    marginLeft: 62,
    fontSize: 15,
    fontWeight: "500",
    color: colors.card,
  },
  actionRow: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 16,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 84,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    backgroundColor: "rgba(255,255,255,0.075)",
  },
  actionButtonCompact: {
    minHeight: 76,
  },
  actionButtonPressed: {
    backgroundColor: "rgba(24,196,98,0.2)",
    transform: [{ scale: 0.96 }],
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.card,
  },
  actionLabelCompact: {
    fontSize: 11,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDF0ED",
    backgroundColor: colors.card,
    ...cardShadow,
  },
  statsCard: {
    flexDirection: "row",
    paddingVertical: 17,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingHorizontal: 3,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statValueCompact: {
    fontSize: 14,
  },
  statLabel: {
    marginTop: 7,
    fontSize: 11,
    textAlign: "center",
    color: colors.textMuted,
  },
  transactionsSection: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "800",
    color: "#07833D",
  },
  transactionCard: {
    overflow: "hidden",
    paddingHorizontal: 14,
  },
  transactionRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
  },
  transactionDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  transactionPressed: {
    opacity: 0.58,
  },
  transactionIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
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
    marginTop: 3,
    fontSize: 11,
    color: colors.textMuted,
  },
  transactionMeta: {
    alignItems: "flex-end",
    paddingLeft: 5,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "800",
  },
  transactionDate: {
    marginTop: 5,
    fontSize: 9,
    color: colors.textMuted,
  },
  earnCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CDEDD7",
    backgroundColor: "#EAF7EE",
  },
  earnIcon: {
    width: 52,
    height: 58,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#F3D34A",
    backgroundColor: "#07833D",
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
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#526078",
  },
  exploreButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: "#07833D",
  },
  exploreButtonCompact: {
    paddingHorizontal: 10,
  },
  exploreButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  exploreButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.card,
  },
});
