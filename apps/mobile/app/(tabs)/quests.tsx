import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type ActionState = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

/** Staggered fade + slide + scale entrance, a touch slower than the
 * Community Quests cards in the EcoBot screen for a calmer cascade here. */
function AnimatedCard({
  index,
  style,
  children,
}: {
  index: number;
  style?: object;
  children: React.ReactNode;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: false,
        }),
      ]).start();
    }, 130 + index * 110);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}
    >
      {children}
    </Animated.View>
  );
}

export default function QuestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [myQuests, setMyQuests] = useState<MyQuest[]>([]);
  const [myQuestsLoading, setMyQuestsLoading] = useState(false);
  const [myQuestsError, setMyQuestsError] = useState<string | null>(null);
  const [startStateByQuestId, setStartStateByQuestId] = useState<Record<string, ActionState>>({});

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

  useFocusEffect(
    useCallback(() => {
      fetchMyQuests();
    }, [])
  );

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

  const openSubmitProof = (quest: MyQuest) => {
    router.push({
      pathname: "/quests/[id]/submit-proof",
      params: {
        id: quest.quest_id,
        title: quest.title ?? "Untitled quest",
        description: quest.description ?? "",
        points_reward: String(quest.points_reward ?? 0),
        progress_percent: String(quest.progress_percent),
      },
    });
  };

  const activeAndCompletedQuests = myQuests.filter(
    (quest) => quest.participation_status === "in_progress" || quest.participation_status === "completed"
  );

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

        {myQuests.map((quest, index) => (
          <AnimatedCard key={quest.quest_id} index={index}>
            <MyQuestCard
              quest={quest}
              startState={startStateByQuestId[quest.quest_id] ?? { kind: "idle" }}
              onStartQuest={() => startQuest(quest.quest_id)}
              onSubmitProof={() => openSubmitProof(quest)}
            />
          </AnimatedCard>
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Quests</Text>

        {!myQuestsLoading && !myQuestsError && activeAndCompletedQuests.length === 0 && (
          <Text style={styles.myQuestsStatusText}>
            No in-progress or completed quests yet.
          </Text>
        )}

        {activeAndCompletedQuests.map((quest, index) => (
          <AnimatedCard key={quest.quest_id} index={index}>
            <MyQuestCard
              quest={quest}
              startState={startStateByQuestId[quest.quest_id] ?? { kind: "idle" }}
              onStartQuest={() => startQuest(quest.quest_id)}
              onSubmitProof={() => openSubmitProof(quest)}
            />
          </AnimatedCard>
        ))}
      </ScrollView>
    </View>
  );
}

function MyQuestCard({
  quest,
  startState,
  onStartQuest,
  onSubmitProof,
}: {
  quest: MyQuest;
  startState: ActionState;
  onStartQuest: () => void;
  onSubmitProof: () => void;
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

      {quest.participation_status === "in_progress" && (
        <Pressable style={styles.startQuestButton} onPress={onSubmitProof}>
          <Text style={styles.startQuestButtonText}>Submit Proof</Text>
        </Pressable>
      )}

      {quest.participation_status === "submitted" && (
        <View style={styles.statusNotice}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={styles.waitingText}>Waiting for verification</Text>
        </View>
      )}

      {quest.participation_status === "completed" && (
        <View style={styles.statusNotice}>
          <Ionicons name="checkmark-circle" size={16} color={colors.brandGreenDark} />
          <Text style={styles.completedText}>Completed</Text>
          <View style={styles.pointsAwardedPill}>
            <MaterialCommunityIcons name="hexagon" size={13} color={colors.coinGold} />
            <Text style={styles.pointsAwardedText}>{quest.points_awarded} points awarded</Text>
          </View>
        </View>
      )}

      {startState.kind === "error" && <Text style={styles.myQuestsErrorText}>{startState.message}</Text>}
    </View>
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
  statusNotice: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  waitingText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  completedText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brandGreenDark,
  },
  pointsAwardedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pointsAwardedText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
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
});
