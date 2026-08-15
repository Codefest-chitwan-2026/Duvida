import { useRef, useState } from "react";
import {
  ActivityIndicator,
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

const initialMessages: Message[] = [
  {
    id: "user-token-question",
    sender: "user",
    time: "Today 10:30 AM",
    text: "How can I earn more vouchers quickly?",
  },
  {
    id: "bot-token-answer",
    sender: "bot",
    time: "10:30 AM",
    body: {
      kind: "numbered",
      intro: "Great question! Here are the fastest ways to earn vouchers:",
      items: [
        "Report real issues in your area with clear photos.",
        "Complete community quests and challenges.",
        "Verify reports and help confirm issues.",
        "Participate in local cleanups or tree plantation drives.",
        "Share helpful sustainability tips with the community.",
      ],
      outro: "Every action you take makes a real impact! 🌍✨",
    },
  },
  {
    id: "user-habits-question",
    sender: "user",
    time: "Today 10:32 AM",
    text: "What are some easy daily sustainability habits?",
  },
  {
    id: "bot-habits-answer",
    sender: "bot",
    time: "10:32 AM",
    body: {
      kind: "bulleted",
      intro: "Here are some simple daily habits you can follow:",
      items: [
        { emoji: "💧", text: "Save water – Take shorter showers and fix leaks." },
        { emoji: "♻️", text: "Reduce waste – Avoid single-use plastics." },
        { emoji: "🚶", text: "Walk or cycle – Reduce your carbon footprint." },
        { emoji: "🌱", text: "Plant more trees and care for green spaces." },
        { emoji: "🔌", text: "Save energy – Turn off lights and unplug devices." },
      ],
      outro: "Small steps every day create big change! 💚",
    },
  },
];

const quickReplies: QuickReply[] = [
  {
    icon: "leaf-outline",
    label: "Daily tips",
    prompt: "What are some easy daily sustainability habits?",
  },
  {
    icon: "star-outline",
    label: "Earn vouchers",
    prompt: "How can I earn more vouchers quickly?",
  },
  {
    icon: "location-outline",
    label: "Report help",
    prompt: "How do I create a useful community issue report?",
  },
];

const followUpReplies: QuickReply[] = [
  {
    icon: "leaf-outline",
    label: "More tips",
    prompt: "Give me more sustainability tips I can use this week.",
  },
  {
    icon: "trophy-outline",
    label: "Quest ideas",
    prompt: "Suggest sustainability quests I can complete nearby.",
  },
  {
    icon: "help-circle-outline",
    label: "How it works",
    prompt: "How does EcoBot use sustainability documents to answer questions?",
  },
];

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={16} color={colors.brandGreenDark} />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function UserBubble({ time, text }: { time: string; text: string }) {
  return (
    <View style={styles.userRow}>
      <Text style={styles.timeLabelRight}>You · {time}</Text>
      <View style={styles.userBubbleRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{text}</Text>
        </View>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={17} color={colors.textOnDark} />
        </View>
      </View>
    </View>
  );
}

function BotMessage({ time, body }: { time: string; body: BotBody }) {
  return (
    <View style={styles.botRow}>
      <BotAvatar size={36} />
      <View style={styles.botMessageColumn}>
        <Text style={styles.botNameLabel}>EcoBot · {time}</Text>
        <View style={styles.botCard}>
          {body.kind === "text" ? (
            <>
              <Text style={styles.botText}>{body.text}</Text>
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
              <Text style={styles.botText}>{body.intro}</Text>
              {body.items.map((item, index) => (
                <View style={styles.listRow} key={`${index}-${item}`}>
                  <View style={styles.listIndex}>
                    <Text style={styles.listIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
              {body.outro ? <Text style={[styles.botText, styles.outro]}>{body.outro}</Text> : null}
            </>
          ) : null}

          {body.kind === "bulleted" ? (
            <>
              <Text style={styles.botText}>{body.intro}</Text>
              {body.items.map((item, index) => (
                <View style={styles.listRow} key={`${index}-${item.text}`}>
                  <Text style={styles.bulletEmoji}>{item.emoji}</Text>
                  <Text style={styles.listItemText}>{item.text}</Text>
                </View>
              ))}
              {body.outro ? <Text style={[styles.botText, styles.outro]}>{body.outro}</Text> : null}
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function SustainabilityAdvisorScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(`EcoBot returned status ${response.status}.`);
      }

      const data = (await response.json()) as {
        answer: string;
        quests?: QuestSuggestion[];
      };

      setMessages((current) => [
        ...current,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          time: formatTime(),
          body: { kind: "text", text: data.answer, quests: data.quests },
        },
      ]);
    } catch (requestError) {
      const detail = requestError instanceof Error ? requestError.message : "Unknown error";
      setError(`Couldn’t reach EcoBot. Check the advisor API and try again. ${detail}`);
    } finally {
      setIsSending(false);
    }
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
          accessibilityLabel="Clear conversation"
          hitSlop={10}
          onPress={() => {
            setMessages(initialMessages);
            setError(null);
          }}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
        >
          <Ionicons name="refresh-outline" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="earth" size={28} color={colors.brandGreenDark} />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>Small actions, real impact</Text>
            <Text style={styles.introBody}>
              Get practical, document-grounded guidance and quest ideas for your community.
            </Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          {quickReplies.map((reply) => (
            <QuickReplyChip
              key={reply.label}
              icon={reply.icon}
              label={reply.label}
              onPress={() => sendMessage(reply.prompt)}
            />
          ))}
        </View>

        {messages.map((message) =>
          message.sender === "user" ? (
            <UserBubble key={message.id} time={message.time} text={message.text} />
          ) : (
            <BotMessage key={message.id} time={message.time} body={message.body} />
          )
        )}

        <View style={styles.chipRow}>
          {followUpReplies.map((reply) => (
            <QuickReplyChip
              key={reply.label}
              icon={reply.icon}
              label={reply.label}
              onPress={() => sendMessage(reply.prompt)}
            />
          ))}
        </View>

        {isSending ? (
          <View style={styles.typingRow}>
            <BotAvatar size={32} />
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={colors.brandGreenDark} />
              <Text style={styles.typingText}>EcoBot is thinking…</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={17} color={colors.severityHigh} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={[styles.composerArea, { marginBottom: Math.max(insets.bottom, 10) + 76 }]}>
        <View style={styles.inputBar}>
          <Ionicons name="leaf-outline" size={18} color={colors.brandGreenDark} />
          <TextInput
            style={styles.input}
            placeholder="Ask EcoBot anything…"
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => sendMessage(draft)}
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
            onPress={() => sendMessage(draft)}
            disabled={!draft.trim() || isSending}
          >
            <Ionicons name="send" size={17} color={colors.textOnDark} />
          </Pressable>
        </View>
      </View>
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
    padding: 16,
    paddingBottom: 12,
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
  botAvatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoIconBg,
    borderWidth: 1,
    borderColor: "#BBF0D0",
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
  pressed: {
    opacity: 0.62,
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
    alignItems: "flex-start",
    gap: 8,
    marginTop: 9,
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
    backgroundColor: colors.surfaceMuted,
  },
  typingText: {
    fontSize: 12,
    color: colors.textMuted,
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
