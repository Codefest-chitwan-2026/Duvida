import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { getQuestById } from "@/features/quests/mockQuests";
import { colors } from "@/theme/colors";

/**
 * Mock verification outcome — stands in for a real GPS/image-similarity +
 * manual-review pipeline. Cycles deterministically off the quest id so all
 * three outcomes stay reachable while testing different quests.
 */
function mockOutcome(id: string): "verified" | "pending" | "rejected" {
  const outcomes = ["verified", "pending", "rejected"] as const;
  return outcomes[id.length % outcomes.length];
}

export default function VerificationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const quest = getQuestById(id);

  useEffect(() => {
    if (!quest) return;
    const outcome = mockOutcome(quest.id);
    const timer = setTimeout(() => {
      if (outcome === "verified") {
        router.replace({ pathname: "/quests/[id]/completed", params: { id: quest.id } });
      } else {
        router.replace({
          pathname: "/quests/[id]/verification-status",
          params: { id: quest.id, status: outcome },
        });
      }
    }, 1100);
    return () => clearTimeout(timer);
  }, [quest, router]);

  if (!quest) {
    return <PlaceholderScreen title="Quest not found" subtitle="This quest is no longer available." />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ActivityIndicator size="large" color={colors.brandGreen} />
      <Text style={styles.title}>Verifying your submission…</Text>
      <Text style={styles.subtitle}>
        Checking GPS consistency, before/after differences, and for reused evidence.
      </Text>
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
    gap: 10,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginTop: 8 },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 19 },
});
