import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

type Message = { id: string; sender: "bot" | "user"; text: string };

type Question = { id: string; prompt: string; options: string[] };

const QUESTIONS: Question[] = [
  {
    id: "transport",
    prompt: "How do you usually get around for daily trips?",
    options: ["Walk / Cycle", "Public transport", "Own vehicle", "Mixed"],
  },
  {
    id: "distance",
    prompt: "About how far do you travel on a typical day?",
    options: ["Under 2 km", "2–10 km", "10–30 km", "30+ km"],
  },
  {
    id: "electricity",
    prompt: "How would you describe your electricity use at home?",
    options: ["Very low", "Moderate", "High", "Not sure"],
  },
  {
    id: "waste",
    prompt: "Do you separate recyclables from general waste?",
    options: ["Always", "Sometimes", "Rarely", "Never"],
  },
];

type AIChatScreenProps = {
  onBack?: () => void;
  onGenerateQuests?: () => void;
};

export function AIChatScreen({ onBack, onGenerateQuests }: AIChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      sender: "bot",
      text: "Hi, I'm EcoBot 🌱 Let's find a few sustainability quests that fit your habits. I'll ask a few quick questions.",
    },
    { id: "q0", sender: "bot", text: QUESTIONS[0].prompt },
  ]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [done, setDone] = useState(false);

  const handleAnswer = (option: string) => {
    const currentQuestion = QUESTIONS[questionIndex];
    const nextIndex = questionIndex + 1;
    const userMessage: Message = { id: `${currentQuestion.id}-a`, sender: "user", text: option };

    if (nextIndex < QUESTIONS.length) {
      const nextQuestion = QUESTIONS[nextIndex];
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: `q${nextIndex}`, sender: "bot", text: nextQuestion.prompt },
      ]);
      setQuestionIndex(nextIndex);
    } else {
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: "wrap-up",
          sender: "bot",
          text: "Thanks! Based on your answers, I've put together a few sustainability quests you can try.",
        },
      ]);
      setDone(true);
    }
  };

  const currentOptions = !done ? QUESTIONS[questionIndex]?.options : undefined;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>AI Sustainability Advisor</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.messages}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, message.sender === "bot" ? styles.bubbleBot : styles.bubbleUser]}
          >
            <Text style={[styles.bubbleText, message.sender === "user" && styles.bubbleTextUser]}>
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {done ? (
          <Pressable style={styles.primaryButton} onPress={onGenerateQuests}>
            <Text style={styles.primaryButtonText}>See My Recommended Quests</Text>
          </Pressable>
        ) : (
          <View style={styles.chipWrap}>
            {currentOptions?.map((option) => (
              <Pressable key={option} style={styles.chip} onPress={() => handleAnswer(option)}>
                <Text style={styles.chipText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}
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
  headerTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  messages: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleBot: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceMuted,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: colors.brandGreen,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 13, color: colors.textPrimary, lineHeight: 19 },
  bubbleTextUser: { color: colors.textOnDark },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.brandGreen,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.brandGreenDark },
  primaryButton: {
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.textOnDark, fontSize: 15, fontWeight: "700" },
});
