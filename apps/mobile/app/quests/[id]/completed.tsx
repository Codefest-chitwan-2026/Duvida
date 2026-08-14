import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { getQuestById } from "@/features/quests/mockQuests";
import { colors } from "@/theme/colors";

export default function QuestCompletedRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const quest = getQuestById(id);

  if (!quest) {
    return <PlaceholderScreen title="Quest not found" subtitle="This quest is no longer available." />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.iconBadge}>
        <Ionicons name="checkmark-circle" size={48} color={colors.brandGreen} />
      </View>

      <Text style={styles.title}>Quest Completed!</Text>
      <Text style={styles.subtitle}>Your proof for &quot;{quest.title}&quot; has been verified.</Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push({ pathname: "/quests/[id]/reward", params: { id: quest.id } })}
      >
        <Text style={styles.primaryButtonText}>Claim Reward</Text>
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
  iconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
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
