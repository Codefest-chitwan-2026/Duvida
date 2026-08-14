import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors } from "@/theme/colors";

export default function AIAdvisorIntroRoute() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.backButton} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconBadge}>
          <Ionicons name="sparkles" size={30} color={colors.textOnDark} />
        </View>
        <Text style={styles.title}>AI Sustainability Advisor</Text>
        <Text style={styles.subtitle}>
          Answer a few quick questions about your transport, energy, and waste habits, and I&apos;ll
          suggest personalized quests to help cut your carbon footprint.
        </Text>

        <View style={styles.topicList}>
          <Topic icon="bus" label="Transport & travel distance" />
          <Topic icon="flash" label="Electricity & energy use" />
          <Topic icon="water" label="Water habits" />
          <Topic icon="trash" label="Waste & recycling habits" />
        </View>

        <Pressable style={styles.primaryButton} onPress={() => router.push("/quests/advisor/chat")}>
          <Text style={styles.primaryButtonText}>Start Chat</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Topic({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.topicRow}>
      <Ionicons name={icon} size={16} color={colors.brandGreenDark} />
      <Text style={styles.topicText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.textPrimary, textAlign: "center" },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 20,
  },
  topicList: { width: "100%", gap: 10, marginBottom: 28 },
  topicRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  topicText: { fontSize: 13, color: colors.textPrimary, fontWeight: "600" },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.textOnDark, fontSize: 15, fontWeight: "700" },
});
