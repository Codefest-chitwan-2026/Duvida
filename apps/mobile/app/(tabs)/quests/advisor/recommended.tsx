import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { getAiSuggestedQuests } from "@/features/quests/mockQuests";
import { colors } from "@/theme/colors";

export default function RecommendedQuestsRoute() {
  const router = useRouter();
  const quests = getAiSuggestedQuests();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Recommended For You</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Based on your answers, here are a few low-carbon quests to try.
        </Text>

        {quests.map((quest) => (
          <Pressable
            key={quest.id}
            style={styles.card}
            onPress={() => router.push({ pathname: "/quests/[id]", params: { id: quest.id } })}
          >
            <PhotoPlaceholder style={styles.thumb} />
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <MaterialCommunityIcons name={quest.icon} size={14} color={colors.brandGreenDark} />
                <Text style={styles.title}>{quest.title}</Text>
              </View>
              <Text style={styles.description}>{quest.description}</Text>
              <View style={styles.statsRow}>
                <MaterialCommunityIcons name="hexagon" size={12} color={colors.coinGold} />
                <Text style={styles.statValue}>{quest.tokens}</Text>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={12}
                  color={colors.brandGreenDark}
                  style={styles.xpIcon}
                />
                <Text style={styles.statValue}>{quest.xp} XP</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
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
  headerTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  info: { flex: 1, gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  description: { fontSize: 12, color: colors.textMuted },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  statValue: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
  xpIcon: { marginLeft: 8 },
});
