import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ProgressRing } from "@/components/ProgressRing";
import { mockQuests, type Quest } from "@/features/quests/mockQuests";
import { colors } from "@/theme/colors";

export default function QuestsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Quests</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 132 }]}>
        {mockQuests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </ScrollView>
    </View>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: "/quests/[id]/submit-proof", params: { id: quest.id } })}
    >
      <PhotoPlaceholder style={styles.thumb} />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name={quest.icon} size={14} color={colors.brandGreenDark} />
          </View>
          <Text style={styles.title}>{quest.title}</Text>
        </View>
        <Text style={styles.description}>{quest.description}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="hexagon" size={13} color={colors.coinGold} />
            <Text style={styles.statValue}>{quest.vouchers}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people" size={13} color={colors.textMuted} />
            <Text style={styles.statValue}>{quest.participants}</Text>
          </View>
        </View>
      </View>
      <ProgressRing percent={quest.progressPercent} size={48} strokeWidth={5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.card,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  description: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
