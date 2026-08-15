import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ProgressRing } from "@/components/ProgressRing";
import { mockQuests, type Quest } from "@/features/quests/mockQuests";
import { env } from "@/lib/env";
import { colors } from "@/theme/colors";

type MyQuest = {
  quest_id: string;
  title: string | null;
  description: string | null;
  quest_type: string | null;
  points_reward: number | null;
  participation_status: string;
  progress_percent: number;
  points_awarded: number;
};

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

type StartState = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

export default function QuestsScreen() {
  const insets = useSafeAreaInsets();
  const [myQuests, setMyQuests] = useState<MyQuest[]>([]);
  const [myQuestsLoading, setMyQuestsLoading] = useState(false);
  const [myQuestsError, setMyQuestsError] = useState<string | null>(null);
  const [startStateByQuestId, setStartStateByQuestId] = useState<Record<string, StartState>>({});

  const fetchMyQuests = async () => {
    setMyQuestsLoading(true);
    setMyQuestsError(null);
    try {
      const response = await fetch(`${env.advisorApiUrl}/quests/my`);
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const data: MyQuest[] = await response.json();
      setMyQuests(data);
    } catch (err) {
      setMyQuestsError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setMyQuestsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuests();
  }, []);

  const startQuest = async (questId: string) => {
    setStartStateByQuestId((prev) => ({ ...prev, [questId]: { kind: "loading" } }));
    try {
      const response = await fetch(`${env.advisorApiUrl}/quests/${questId}/start`, { method: "POST" });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      setStartStateByQuestId((prev) => ({ ...prev, [questId]: { kind: "idle" } }));
      await fetchMyQuests();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setStartStateByQuestId((prev) => ({ ...prev, [questId]: { kind: "error", message } }));
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Quests</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 132 }]}>
        <Text style={styles.sectionTitle}>My Quests</Text>

        {myQuestsLoading && (
          <View style={styles.myQuestsStatusRow}>
            <ActivityIndicator size="small" color={colors.brandGreenDark} />
            <Text style={styles.myQuestsStatusText}>Loading your quests...</Text>
          </View>
        )}

        {myQuestsError && <Text style={styles.myQuestsErrorText}>{myQuestsError}</Text>}

        {!myQuestsLoading && !myQuestsError && myQuests.length === 0 && (
          <Text style={styles.myQuestsStatusText}>
            You haven't accepted any quests yet. Generate one from a community issue to see it here.
          </Text>
        )}

        {myQuests.map((quest) => (
          <MyQuestCard
            key={quest.quest_id}
            quest={quest}
            startState={startStateByQuestId[quest.quest_id] ?? { kind: "idle" }}
            onStartQuest={() => startQuest(quest.quest_id)}
          />
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Quests</Text>
        {mockQuests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </ScrollView>
    </View>
  );
}

function MyQuestCard({
  quest,
  startState,
  onStartQuest,
}: {
  quest: MyQuest;
  startState: StartState;
  onStartQuest: () => void;
}) {
  return (
    <View style={styles.myQuestCard}>
      <Text style={styles.myQuestLabel}>Quest title</Text>
      <Text style={styles.myQuestTitle}>{quest.title ?? "Untitled quest"}</Text>

      <View style={styles.myQuestRow}>
        <View style={styles.myQuestRowItem}>
          <Text style={styles.myQuestLabel}>Status</Text>
          <Text style={styles.myQuestValue}>{formatStatus(quest.participation_status)}</Text>
        </View>
        <View style={styles.myQuestRowItem}>
          <Text style={styles.myQuestLabel}>Progress</Text>
          <Text style={styles.myQuestValue}>{quest.progress_percent}%</Text>
        </View>
        <View style={styles.myQuestRowItem}>
          <Text style={styles.myQuestLabel}>Reward</Text>
          <Text style={styles.myQuestValue}>{quest.points_reward ?? 0} points</Text>
        </View>
      </View>

      {quest.participation_status === "joined" && (
        <Pressable
          style={styles.startQuestButton}
          onPress={onStartQuest}
          disabled={startState.kind === "loading"}
        >
          {startState.kind === "loading" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.startQuestButtonText}>Start Quest</Text>
          )}
        </Pressable>
      )}

      {startState.kind === "error" && <Text style={styles.myQuestsErrorText}>{startState.message}</Text>}
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
            <Text style={styles.statValue}>{quest.tokens}</Text>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionTitleSpacing: {
    marginTop: 8,
  },
  myQuestsStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  myQuestsStatusText: {
    fontSize: 12.5,
    color: colors.textMuted,
  },
  myQuestsErrorText: {
    fontSize: 12.5,
    color: "#DC2626",
    marginBottom: 8,
  },
  myQuestCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
  },
  myQuestLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 2,
  },
  myQuestTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  myQuestRow: {
    flexDirection: "row",
    gap: 12,
  },
  myQuestRowItem: {
    flex: 1,
  },
  myQuestValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  startQuestButton: {
    marginTop: 12,
    backgroundColor: colors.brandGreenDark,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  startQuestButtonText: {
    color: "#fff",
    fontSize: 13.5,
    fontWeight: "700",
  },
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
