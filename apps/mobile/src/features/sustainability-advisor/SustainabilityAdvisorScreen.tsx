import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { env } from "@/lib/env";
import { colors } from "@/theme/colors";

type QuickReply = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  prompt: string;
};

type QuestSuggestion = {
  title: string;
  description: string;
};

type BotBody =
  | { kind: "text"; text: string; quests?: QuestSuggestion[] }
  | { kind: "numbered"; intro: string; items: string[]; outro?: string }
  | {
      kind: "bulleted";
      intro: string;
      items: { emoji: string; text: string }[];
      outro?: string;
    };

type Message =
  | { id: string; sender: "user"; time: string; text: string }
  | { id: string; sender: "bot"; time: string; body: BotBody };

type ScreenMode = "choose" | "chat" | "community";

type CommunityIssue = {
  id: string;
  title: string | null;
  description: string | null;
  category_id: string | null;
  status: string;
  severity: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  created_at: string | null;
};

type GeneratedQuest = {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  points_reward: number;
  status: string;
};

type AcceptanceState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "accepted" };

type QuestCardState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; quest: GeneratedQuest; acceptance: AcceptanceState };

const SDG_ADVICE_MENU_PROMPT = "Sure! 🌱 What would you like advice on?";

const SDG_ADVICE_TOPICS: BotBody = {
  kind: "numbered",
  intro: "You can ask advice related to:",
  items: [
    "Saving water",
    "Reducing waste",
    "Energy saving tips",
    "Low-carbon transport",
    "Greenery tips",
    "Helping your community",
    "SDGs 11, 12, and 13",
  ],
};

const quickReplies: QuickReply[] = [
  {
    icon: "water-outline",
    label: "Save water",
    prompt: "How can I save water?",
  },
  {
    icon: "trash-outline",
    label: "Reduce waste",
    prompt: "How can I reduce waste?",
  },
  {
    icon: "flash-outline",
    label: "Save energy",
    prompt: "How can I save electricity?",
  },
];

const followUpReplies: QuickReply[] = [
  {
    icon: "leaf-outline",
    label: "Greenery",
    prompt: "Why are trees important?",
  },
  {
    icon: "bicycle-outline",
    label: "Transport",
    prompt: "How can I travel sustainably?",
  },
  {
    icon: "people-outline",
    label: "Community",
    prompt: "How can I help my community?",
  },
];

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

async function responseError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { detail?: string };
    return body.detail ?? `${fallback} (${response.status})`;
  } catch {
    return `${fallback} (${response.status})`;
  }
}

function BotAvatar({ size = 40 }: { size?: number }) {
  return (
    <View style={[styles.botAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <MaterialCommunityIcons
        name="robot-happy-outline"
        size={size * 0.6}
        color={colors.brandGreenDark}
      />
    </View>
  );
}

function QuickReplyChip({
  icon,
  label,
  onPress,
}: Pick<QuickReply, "icon" | "label"> & { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      <Ionicons name={icon} size={16} color={colors.brandGreenDark} />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function ModeCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.modeCard, pressed && styles.pressed]}
    >
      <View style={styles.modeIcon}>
        <Ionicons name={icon} size={25} color={colors.brandGreenDark} />
      </View>
      <View style={styles.modeCopy}>
        <Text style={styles.modeTitle}>{title}</Text>
        <Text style={styles.modeDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

function UserBubble({ time, text }: { time: string; text: string }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.userRow,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.timeLabelRight}>You · {time}</Text>
      <View style={styles.userBubbleRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{text}</Text>
        </View>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={17} color={colors.textOnDark} />
        </View>
      </View>
    </Animated.View>
  );
}

function TypewriterText({
  text,
  onUpdate,
}: {
  text: string;
  onUpdate?: () => void;
}) {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    let current = 0;
    const total = text.length;
    // Smooth character & word stream rate
    const step = Math.max(1, Math.floor(total / 35));
    const timer = setInterval(() => {
      current = Math.min(current + step, total);
      setDisplayedLength(current);
      onUpdate?.();
      if (current >= total) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [text, onUpdate]);

  const isTyping = displayedLength < text.length;

  return (
    <Text style={styles.botText}>
      {text.slice(0, displayedLength)}
      {isTyping && <Text style={styles.cursorDot}> ▍</Text>}
    </Text>
  );
}

function StaggeredListItem({
  index,
  children,
  onPress,
}: {
  index: number;
  children: React.ReactNode;
  onPress?: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 45,
          useNativeDriver: false,
        }),
      ]).start();
    }, 180 + index * 95);

    return () => clearTimeout(timer);
  }, [index, fadeAnim, slideAnim]);

  const inner = (
    <Animated.View
      style={[
        styles.listRow,
        onPress && styles.interactiveListRow,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
        accessibilityRole="button"
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

function BotMessage({
  time,
  body,
  onStreamUpdate,
  onSelectItem,
}: {
  time: string;
  body: BotBody;
  onStreamUpdate?: () => void;
  onSelectItem?: (item: string) => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
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
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.botRow,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <BotAvatar size={36} />
      <View style={styles.botMessageColumn}>
        <Text style={styles.botNameLabel}>EcoBot · {time}</Text>
        <View style={styles.botCard}>
          {body.kind === "text" ? (
            <>
              <TypewriterText text={body.text} onUpdate={onStreamUpdate} />
              {body.quests?.map((quest) => (
                <View key={`${quest.title}-${quest.description}`} style={styles.questSuggestion}>
                  <View style={styles.questIcon}>
                    <Ionicons name="leaf" size={14} color={colors.brandGreenDark} />
                  </View>
                  <View style={styles.questCopy}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <Text style={styles.questDescription}>{quest.description}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : null}

          {body.kind === "numbered" ? (
            <>
              <TypewriterText text={body.intro} onUpdate={onStreamUpdate} />
              {body.items.map((item, index) => (
                <StaggeredListItem
                  key={`${index}-${item}`}
                  index={index}
                  onPress={() => onSelectItem?.(item)}
                >
                  <View style={styles.listIndex}>
                    <Text style={styles.listIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.listItemText}>{item}</Text>
                  {onSelectItem ? (
                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color={colors.brandGreenDark}
                      style={{ opacity: 0.65 }}
                    />
                  ) : null}
                </StaggeredListItem>
              ))}
              {body.outro ? (
                <View style={{ marginTop: 6 }}>
                  <TypewriterText text={body.outro} onUpdate={onStreamUpdate} />
                </View>
              ) : null}
            </>
          ) : null}

          {body.kind === "bulleted" ? (
            <>
              <TypewriterText text={body.intro} onUpdate={onStreamUpdate} />
              {body.items.map((item, index) => (
                <StaggeredListItem key={`${index}-${item.text}`} index={index}>
                  <Text style={styles.bulletEmoji}>{item.emoji}</Text>
                  <Text style={styles.listItemText}>{item.text}</Text>
                </StaggeredListItem>
              ))}
              {body.outro ? (
                <View style={{ marginTop: 6 }}>
                  <TypewriterText text={body.outro} onUpdate={onStreamUpdate} />
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

function TypingWaveIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnim = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -5,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.delay(350 - delay),
        ])
      );
    };

    const a1 = createDotAnim(dot1, 0);
    const a2 = createDotAnim(dot2, 120);
    const a3 = createDotAnim(dot3, 240);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingRow}>
      <BotAvatar size={32} />
      <View style={styles.typingBubble}>
        <View style={styles.typingDotsContainer}>
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
        </View>
        <Text style={styles.typingText}>EcoBot is thinking…</Text>
      </View>
    </View>
  );
}

function IssueCard({
  issue,
  questState,
  onGenerateQuest,
  onAcceptQuest,
}: {
  issue: CommunityIssue;
  questState: QuestCardState;
  onGenerateQuest: () => void;
  onAcceptQuest: () => void;
}) {
  const location = [issue.address, issue.city].filter(Boolean).join(", ") || "Location unavailable";

  return (
    <View style={styles.issueCard}>
      <View style={styles.issueHeaderRow}>
        <View style={styles.issueHeaderCopy}>
          <Text style={styles.issueEyebrow}>Community issue</Text>
          <Text style={styles.issueTitle}>{issue.title ?? "Untitled issue"}</Text>
        </View>
        <View style={styles.severityBadge}>
          <Text style={styles.severityText}>{issue.severity ?? "unknown"}</Text>
        </View>
      </View>

      {issue.description ? <Text style={styles.issueDescription}>{issue.description}</Text> : null}

      <View style={styles.issueLocationRow}>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
        <Text style={styles.issueLocation}>{location}</Text>
      </View>

      {questState.status === "success" ? (
        <View style={styles.generatedQuestBox}>
          <Text style={styles.generatedQuestLabel}>AI-generated quest</Text>
          <Text style={styles.generatedQuestTitle}>{questState.quest.title}</Text>
          <Text style={styles.generatedQuestDescription}>{questState.quest.description}</Text>
          <View style={styles.generatedQuestMetaRow}>
            <Text style={styles.generatedQuestMeta}>{questState.quest.quest_type}</Text>
            <Text style={styles.generatedQuestMeta}>{questState.quest.points_reward} points</Text>
          </View>

          {questState.acceptance.kind === "accepted" ? (
            <View style={styles.acceptedBox}>
              <Ionicons name="checkmark-circle" size={18} color={colors.brandGreenDark} />
              <Text style={styles.acceptedText}>Quest accepted · Joined</Text>
            </View>
          ) : (
            <Pressable
              onPress={onAcceptQuest}
              disabled={questState.acceptance.kind === "loading"}
              style={({ pressed }) => [styles.acceptButton, pressed && styles.pressed]}
            >
              {questState.acceptance.kind === "loading" ? (
                <ActivityIndicator size="small" color={colors.textOnDark} />
              ) : (
                <Text style={styles.actionButtonText}>Accept Quest</Text>
              )}
            </Pressable>
          )}

          {questState.acceptance.kind === "error" ? (
            <Text style={styles.inlineError}>{questState.acceptance.message}</Text>
          ) : null}
        </View>
      ) : (
        <Pressable
          onPress={onGenerateQuest}
          disabled={questState.status === "loading"}
          style={({ pressed }) => [styles.generateButton, pressed && styles.pressed]}
        >
          {questState.status === "loading" ? (
            <ActivityIndicator size="small" color={colors.textOnDark} />
          ) : (
            <>
              <Ionicons name="sparkles" size={16} color={colors.textOnDark} />
              <Text style={styles.actionButtonText}>Generate Quest</Text>
            </>
          )}
        </Pressable>
      )}

      {questState.status === "error" ? (
        <Text style={styles.inlineError}>{questState.message}</Text>
      ) : null}
    </View>
  );
}

export default function SustainabilityAdvisorScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [screenMode, setScreenMode] = useState<ScreenMode>("choose");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  const [questStateByIssueId, setQuestStateByIssueId] = useState<Record<string, QuestCardState>>({});

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, sender: "user", time: formatTime(), text: trimmed },
    ]);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch(`${env.advisorApiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(await responseError(response, "EcoBot request failed"));
      }

      const data = (await response.json()) as {
        answer: string;
        quests?: QuestSuggestion[];
      };
      const botTime = formatTime();
      const reply: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        time: botTime,
        body: { kind: "text", text: data.answer, quests: data.quests },
      };

      if (data.answer === SDG_ADVICE_MENU_PROMPT) {
        setMessages((current) => [...current, reply]);
        setTimeout(() => {
          setMessages((current) => [
            ...current,
            {
              id: `bot-${Date.now()}-topics`,
              sender: "bot",
              time: formatTime(),
              body: SDG_ADVICE_TOPICS,
            },
          ]);
        }, 600);
      } else {
        setMessages((current) => [...current, reply]);
      }
    } catch (requestError) {
      const detail = requestError instanceof Error ? requestError.message : "Unknown error";
      setError(`Couldn’t reach EcoBot. Check the advisor API and try again. ${detail}`);
    } finally {
      setIsSending(false);
    }
  };

  const openSdgAdvice = () => {
    setScreenMode("chat");
    void sendMessage("I need SDG Advice");
  };

  const fetchIssues = async () => {
    setIssuesError(null);
    setIssuesLoading(true);

    try {
      const response = await fetch(`${env.advisorApiUrl}/community/issues`);
      if (!response.ok) {
        throw new Error(await responseError(response, "Could not load community issues"));
      }
      setIssues((await response.json()) as CommunityIssue[]);
    } catch (requestError) {
      setIssuesError(
        requestError instanceof Error ? requestError.message : "Could not load community issues."
      );
    } finally {
      setIssuesLoading(false);
    }
  };

  const openCommunityQuests = () => {
    setScreenMode("community");
    void fetchIssues();
  };

  const generateQuest = async (issueId: string) => {
    setQuestStateByIssueId((current) => ({ ...current, [issueId]: { status: "loading" } }));

    try {
      const response = await fetch(
        `${env.advisorApiUrl}/community/issues/${issueId}/generate-quest`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error(await responseError(response, "Could not generate quest"));
      }

      const quest = (await response.json()) as GeneratedQuest;
      setQuestStateByIssueId((current) => ({
        ...current,
        [issueId]: { status: "success", quest, acceptance: { kind: "idle" } },
      }));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not generate quest.";
      setQuestStateByIssueId((current) => ({
        ...current,
        [issueId]: { status: "error", message },
      }));
    }
  };

  const acceptQuest = async (issueId: string, questId: string) => {
    setQuestStateByIssueId((current) => {
      const state = current[issueId];
      if (state?.status !== "success") return current;
      return { ...current, [issueId]: { ...state, acceptance: { kind: "loading" } } };
    });

    try {
      const response = await fetch(`${env.advisorApiUrl}/quests/${questId}/accept`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(await responseError(response, "Could not accept quest"));
      }

      setQuestStateByIssueId((current) => {
        const state = current[issueId];
        if (state?.status !== "success") return current;
        return { ...current, [issueId]: { ...state, acceptance: { kind: "accepted" } } };
      });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not accept quest.";
      setQuestStateByIssueId((current) => {
        const state = current[issueId];
        if (state?.status !== "success") return current;
        return { ...current, [issueId]: { ...state, acceptance: { kind: "error", message } } };
      });
    }
  };

  const resetEcoBot = () => {
    setScreenMode("choose");
    setMessages([]);
    setDraft("");
    setError(null);
    setIssuesError(null);
    setQuestStateByIssueId({});
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BotAvatar size={42} />
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Sustainability Advisor</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerSubtitle}>EcoBot · Online</Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel={screenMode === "choose" ? "Reset EcoBot" : "Back to EcoBot menu"}
          hitSlop={10}
          onPress={resetEcoBot}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
        >
          <Ionicons
            name={screenMode === "choose" ? "refresh-outline" : "arrow-back"}
            size={22}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (screenMode === "chat") scrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {screenMode === "choose" ? (
          <View style={styles.chooseContainer}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="earth" size={34} color={colors.brandGreenDark} />
            </View>
            <Text style={styles.welcomeTitle}>How can EcoBot help?</Text>
            <Text style={styles.welcomeDescription}>
              Get practical SDG guidance or turn a reported community problem into an actionable quest.
            </Text>
            <View style={styles.modeList}>
              <ModeCard
                icon="leaf-outline"
                title="Ask SDG Advice"
                description="Explore water, waste, energy, transport, greenery, and SDG guidance."
                onPress={openSdgAdvice}
              />
              <ModeCard
                icon="people-outline"
                title="Community Quests"
                description="View reported issues, generate an AI quest, and join the action."
                onPress={openCommunityQuests}
              />
            </View>
          </View>
        ) : null}

        {screenMode === "chat" ? (
          <>
            <View style={styles.introCard}>
              <View style={styles.introIcon}>
                <Ionicons name="leaf" size={25} color={colors.brandGreenDark} />
              </View>
              <View style={styles.introCopy}>
                <Text style={styles.introTitle}>Practical SDG advice</Text>
                <Text style={styles.introBody}>
                  Ask a question or choose a topic to get a focused sustainability action.
                </Text>
              </View>
            </View>

            <View style={styles.chipRow}>
              {quickReplies.map((reply) => (
                <QuickReplyChip
                  key={reply.label}
                  icon={reply.icon}
                  label={reply.label}
                  onPress={() => void sendMessage(reply.prompt)}
                />
              ))}
            </View>

            {messages.map((message) =>
              message.sender === "user" ? (
                <UserBubble key={message.id} time={message.time} text={message.text} />
              ) : (
                <BotMessage
                  key={message.id}
                  time={message.time}
                  body={message.body}
                  onStreamUpdate={() => scrollRef.current?.scrollToEnd({ animated: true })}
                  onSelectItem={(topic) => void sendMessage(`How can I help with ${topic}?`)}
                />
              )
            )}

            <View style={styles.chipRow}>
              {followUpReplies.map((reply) => (
                <QuickReplyChip
                  key={reply.label}
                  icon={reply.icon}
                  label={reply.label}
                  onPress={() => void sendMessage(reply.prompt)}
                />
              ))}
            </View>

            {isSending ? <TypingWaveIndicator /> : null}
          </>
        ) : null}

        {screenMode === "community" ? (
          <View style={styles.communityContainer}>
            <View style={styles.communityTitleRow}>
              <View style={styles.communityTitleCopy}>
                <Text style={styles.communityTitle}>Community Quests</Text>
                <Text style={styles.communityDescription}>
                  Turn an active community report into a practical quest powered by EcoBot.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Refresh community issues"
                onPress={() => void fetchIssues()}
                style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
              >
                <Ionicons name="refresh" size={18} color={colors.brandGreenDark} />
              </Pressable>
            </View>

            {issuesLoading ? (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={colors.brandGreenDark} />
                <Text style={styles.statusText}>Loading community issues…</Text>
              </View>
            ) : null}

            {issuesError ? (
              <View style={styles.errorPanel}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.severityHigh} />
                <Text style={styles.errorPanelText}>{issuesError}</Text>
              </View>
            ) : null}

            {!issuesLoading && !issuesError && issues.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={30} color={colors.brandGreenDark} />
                <Text style={styles.emptyTitle}>No active issues right now</Text>
                <Text style={styles.emptyDescription}>Refresh later when new reports are available.</Text>
              </View>
            ) : null}

            {issues.map((issue) => {
              const questState = questStateByIssueId[issue.id] ?? { status: "idle" as const };
              return (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  questState={questState}
                  onGenerateQuest={() => void generateQuest(issue.id)}
                  onAcceptQuest={() => {
                    if (questState.status === "success") {
                      void acceptQuest(issue.id, questState.quest.id);
                    }
                  }}
                />
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      {screenMode === "chat" && error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={17} color={colors.severityHigh} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {screenMode === "chat" ? (
        <View style={[styles.composerArea, { marginBottom: Math.max(insets.bottom, 10) + 76 }]}>
          <View style={styles.inputBar}>
            <Ionicons name="leaf-outline" size={18} color={colors.brandGreenDark} />
            <TextInput
              style={styles.input}
              placeholder="Ask EcoBot anything…"
              placeholderTextColor={colors.textMuted}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => void sendMessage(draft)}
              returnKeyType="send"
              editable={!isSending}
            />
            <Pressable
              accessibilityLabel="Send message"
              style={({ pressed }) => [
                styles.sendButton,
                (!draft.trim() || isSending) && styles.sendButtonDisabled,
                pressed && styles.pressed,
              ]}
              onPress={() => void sendMessage(draft)}
              disabled={!draft.trim() || isSending}
            >
              <Ionicons name="send" size={17} color={colors.textOnDark} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ height: Math.max(insets.bottom, 10) + 76 }} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  onlineRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brandGreen,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 14,
  },
  botAvatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoIconBg,
    borderWidth: 1,
    borderColor: "#BBF0D0",
  },
  pressed: {
    opacity: 0.62,
  },
  chooseContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  welcomeIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoIconBg,
  },
  welcomeTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  welcomeDescription: {
    maxWidth: 360,
    marginTop: 7,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  modeList: {
    width: "100%",
    gap: 11,
    marginTop: 24,
  },
  modeCard: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C9EFD5",
    borderRadius: 17,
    backgroundColor: colors.infoBg,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  modeCopy: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  modeDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: "#C9EFD5",
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  introCopy: {
    flex: 1,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.brandGreenDark,
  },
  introBody: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#BBF0D0",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
  },
  chipText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  userRow: {
    marginBottom: 17,
  },
  timeLabelRight: {
    marginBottom: 4,
    fontSize: 10,
    textAlign: "right",
    color: colors.textMuted,
  },
  userBubbleRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 8,
  },
  userBubble: {
    maxWidth: "78%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderBottomRightRadius: 5,
    backgroundColor: colors.brandGreenDark,
  },
  userBubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnDark,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#374151",
  },
  botRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginBottom: 17,
  },
  botMessageColumn: {
    flex: 1,
    minWidth: 0,
  },
  botNameLabel: {
    marginBottom: 4,
    fontSize: 10,
    color: colors.textMuted,
  },
  botCard: {
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    borderTopLeftRadius: 5,
    backgroundColor: colors.surfaceMuted,
  },
  botText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  outro: {
    marginTop: 8,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  interactiveListRow: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "rgba(187, 240, 208, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(187, 240, 208, 0.5)",
  },
  listIndex: {
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandGreenDark,
  },
  listIndexText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textOnDark,
  },
  bulletEmoji: {
    marginTop: 1,
    fontSize: 14,
  },
  listItemText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  questSuggestion: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  questIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoIconBg,
  },
  questCopy: {
    flex: 1,
  },
  questTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  questDescription: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typingDotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 16,
    paddingHorizontal: 2,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brandGreenDark,
  },
  typingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brandGreenDark,
  },
  cursorDot: {
    color: colors.brandGreenDark,
    fontWeight: "900",
  },
  communityContainer: {
    flex: 1,
  },
  communityTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  communityTitleCopy: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  communityDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoIconBg,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 28,
  },
  statusText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  errorPanel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  errorPanelText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.severityHigh,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 38,
    paddingHorizontal: 18,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  emptyDescription: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
    color: colors.textMuted,
  },
  issueCard: {
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.card,
  },
  issueHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  issueHeaderCopy: {
    flex: 1,
  },
  issueEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.brandGreenDark,
  },
  issueTitle: {
    marginTop: 3,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  severityBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
    color: colors.textMuted,
  },
  issueDescription: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  issueLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 9,
    marginBottom: 12,
  },
  issueLocation: {
    flex: 1,
    fontSize: 11,
    color: colors.textMuted,
  },
  generateButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 999,
    backgroundColor: colors.brandGreen,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textOnDark,
  },
  generatedQuestBox: {
    padding: 12,
    borderRadius: 13,
    backgroundColor: colors.infoBg,
  },
  generatedQuestLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    color: colors.brandGreenDark,
  },
  generatedQuestTitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  generatedQuestDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  generatedQuestMetaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 9,
    marginBottom: 10,
  },
  generatedQuestMeta: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    color: colors.brandGreenDark,
  },
  acceptButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: colors.brandGreenDark,
  },
  acceptedBox: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#BBF0D0",
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  acceptedText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.brandGreenDark,
  },
  inlineError: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    color: colors.severityHigh,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginHorizontal: 16,
    marginTop: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: colors.severityHigh,
  },
  composerArea: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputBar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 13,
    paddingRight: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandGreenDark,
  },
  sendButtonDisabled: {
    backgroundColor: "#A7D9B8",
  },
});
