import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { getQuestById } from "@/features/quests/mockQuests";
import { colors } from "@/theme/colors";

export default function VerificationStatusRoute() {
  const { id, status } = useLocalSearchParams<{ id: string; status: "pending" | "rejected" }>();
  const router = useRouter();
  const quest = getQuestById(id);

  if (!quest) {
    return <PlaceholderScreen title="Quest not found" subtitle="This quest is no longer available." />;
  }

  const isRejected = status === "rejected";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.iconBadge, { backgroundColor: isRejected ? colors.severityHigh : colors.severityMedium }]}>
        <Ionicons name={isRejected ? "close" : "time"} size={30} color={colors.textOnDark} />
      </View>

      <Text style={styles.title}>{isRejected ? "Submission Rejected" : "Pending Review"}</Text>
      <Text style={styles.subtitle}>
        {isRejected
          ? "Your proof didn't clearly show the completed work at this location. Retake your photos and try again."
          : "Your submission needs a closer look. A moderator will review it manually — check back soon."}
      </Text>

      <View style={styles.actions}>
        {isRejected ? (
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace({ pathname: "/quests/[id]/submit-proof", params: { id: quest.id } })}
          >
            <Text style={styles.primaryButtonText}>Retry Submission</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/quests")}>
          <Text style={styles.secondaryButtonText}>Back to Quests</Text>
        </Pressable>
      </View>
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
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 19, marginBottom: 24 },
  actions: { width: "100%", gap: 10 },
  primaryButton: {
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.textOnDark, fontSize: 15, fontWeight: "700" },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
});
