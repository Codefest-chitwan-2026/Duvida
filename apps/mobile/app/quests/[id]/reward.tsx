import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { getQuestById } from "@/features/quests/mockQuests";
import { colors } from "@/theme/colors";

export default function RewardEarnedRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const quest = getQuestById(id);

  if (!quest) {
    return <PlaceholderScreen title="Quest not found" subtitle="This quest is no longer available." />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Text style={styles.celebrate}>🎉</Text>
      <Text style={styles.title}>Reward Earned!</Text>

      <View style={styles.rewardRow}>
        <View style={styles.rewardPill}>
          <MaterialCommunityIcons name="hexagon" size={18} color={colors.coinGold} />
          <Text style={styles.rewardValue}>+{quest.tokens} tokens</Text>
        </View>
        <View style={styles.rewardPill}>
          <MaterialCommunityIcons name="star-four-points" size={18} color={colors.brandGreenDark} />
          <Text style={styles.rewardValue}>+{quest.xp} XP</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Your points and XP have been added to your wallet and profile.
      </Text>

      <Pressable style={styles.primaryButton} onPress={() => router.push("/quests")}>
        <Text style={styles.primaryButtonText}>Back to Quests</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  celebrate: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, marginBottom: 16 },
  rewardRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  rewardPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rewardValue: { fontSize: 13, fontWeight: "800", color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 19, marginBottom: 28 },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.textOnDark, fontSize: 15, fontWeight: "700" },
});
