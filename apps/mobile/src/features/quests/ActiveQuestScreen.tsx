import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { Quest } from "@/features/quests/mockQuests";
import { colors } from "@/theme/colors";

type ActiveQuestScreenProps = {
  quest: Quest;
  onBack?: () => void;
  onSubmitProof?: () => void;
};

export function ActiveQuestScreen({ quest, onBack, onSubmitProof }: ActiveQuestScreenProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (index: number) => setChecked((prev) => ({ ...prev, [index]: !prev[index] }));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Quest in Progress</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{quest.title}</Text>
        <Text style={styles.subtitle}>Work through the steps below, then submit your proof.</Text>

        <View style={styles.card}>
          {quest.steps.map((step, index) => (
            <Pressable key={step} style={styles.stepRow} onPress={() => toggle(index)}>
              <Ionicons
                name={checked[index] ? "checkbox" : "square-outline"}
                size={20}
                color={checked[index] ? colors.brandGreen : colors.textMuted}
              />
              <Text style={[styles.stepText, checked[index] && styles.stepTextDone]}>{step}</Text>
            </Pressable>
          ))}
        </View>

        {quest.safetyNote ? (
          <View style={styles.safetyCard}>
            <Ionicons name="warning" size={18} color={colors.severityHigh} />
            <Text style={styles.safetyText}>{quest.safetyNote}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.submitButton} onPress={onSubmitProof}>
          <Text style={styles.submitButtonText}>I&apos;m Done — Submit Proof</Text>
        </Pressable>
      </View>
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
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  title: { fontSize: 20, fontWeight: "800", color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted },
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  stepText: { flex: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  stepTextDone: { color: colors.textMuted, textDecorationLine: "line-through" },
  safetyCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.tipsBg,
    borderRadius: 12,
    padding: 12,
    alignItems: "flex-start",
  },
  safetyText: { flex: 1, fontSize: 12, color: colors.textPrimary, lineHeight: 18 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: { color: colors.textOnDark, fontSize: 15, fontWeight: "700" },
});
