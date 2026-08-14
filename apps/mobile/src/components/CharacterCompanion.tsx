import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

const COMPANION_IMAGE = require("@/assets/companion.png");

const DEFAULT_TIPS = [
  "Welcome back, Citizen! 🌿 Ready to clean up the city today? Check nearby hazards or start a quest!",
  "Tip: You can earn +150 XP and Civic Coins by confirming potholes or waste reports in your area! 🪙",
  "Great job! Keep participating in community cleanups to unlock the 'Eco Guardian' badge! 🏆",
];

type CharacterCompanionProps = {
  bottomOffset?: number;
  message?: string;
  onQuestShortcut?: () => void;
};

export function CharacterCompanion({
  bottomOffset = 100,
  message,
  onQuestShortcut,
}: CharacterCompanionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  // Entrance slide from left side (-280 to 0)
  const [slideAnim] = useState(() => new Animated.Value(-320));
  // Floating breathing/bobbing animation
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Slide in from left side on mount
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 7,
      tension: 45,
      useNativeDriver: false,
    }).start();

    // Subtle gentle bobbing loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1400,
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: false,
        }),
      ])
    );
    floatLoop.start();

    return () => floatLoop.stop();
  }, [slideAnim, floatAnim]);

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % DEFAULT_TIPS.length);
  };

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -320,
      duration: 220,
      useNativeDriver: false,
    }).start(() => setIsOpen(false));
  };

  const handleReopen = () => {
    setIsOpen(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 7,
      tension: 45,
      useNativeDriver: false,
    }).start();
  };

  const currentMessage = message || DEFAULT_TIPS[tipIndex];

  if (!isOpen) {
    // Collapsed floating character icon at bottom-left
    return (
      <TouchableOpacity
        onPress={handleReopen}
        activeOpacity={0.8}
        style={[styles.minimizedButton, { bottom: bottomOffset }]}
      >
        <Image source={COMPANION_IMAGE} style={styles.minimizedImage} />
        <View style={styles.minimizedDot} />
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          transform: [
            { translateX: slideAnim },
            { translateY: floatAnim },
          ],
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Speech / Dialog Box */}
      <View style={styles.speechBubble}>
        <View style={styles.bubbleHeader}>
          <View style={styles.botBadge}>
            <View style={styles.greenPulseDot} />
            <Text style={styles.botBadgeText}>EcoGuide AI</Text>
          </View>

          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={14} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        </View>

        <Text style={styles.speechText}>{currentMessage}</Text>

        <View style={styles.bubbleActions}>
          <TouchableOpacity
            onPress={handleNextTip}
            style={styles.actionPill}
            activeOpacity={0.7}
          >
            <Ionicons name="sync" size={12} color={colors.teal} />
            <Text style={styles.actionPillText}>Next tip</Text>
          </TouchableOpacity>

          {onQuestShortcut && (
            <TouchableOpacity
              onPress={onQuestShortcut}
              style={[styles.actionPill, styles.actionPillPrimary]}
              activeOpacity={0.7}
            >
              <Ionicons name="trophy" size={12} color={colors.textOnDark} />
              <Text style={[styles.actionPillText, { color: colors.textOnDark }]}>View Quests</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Speech Bubble Arrow pointing left to character */}
        <View style={styles.bubbleArrow} />
      </View>

      {/* Character Image */}
      <TouchableOpacity
        onPress={handleNextTip}
        activeOpacity={0.9}
        style={styles.characterWrap}
      >
        <Image
          source={COMPANION_IMAGE}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: 320,
    zIndex: 45,
  },
  characterWrap: {
    width: 94,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  characterImage: {
    width: "100%",
    height: "100%",
  },
  speechBubble: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.35)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    position: "relative",
  },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  botBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(34, 197, 94, 0.18)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brandGreen,
  },
  botBadgeText: {
    color: colors.brandGreen,
    fontSize: 10.5,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 2,
  },
  speechText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    lineHeight: 16.5,
    fontWeight: "500",
    marginBottom: 8,
  },
  bubbleActions: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionPillPrimary: {
    backgroundColor: colors.brandGreen,
  },
  actionPillText: {
    color: colors.teal,
    fontSize: 10.5,
    fontWeight: "700",
  },
  bubbleArrow: {
    position: "absolute",
    right: -8,
    bottom: 24,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "rgba(15, 23, 42, 0.95)",
  },
  minimizedButton: {
    position: "absolute",
    left: 14,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 2,
    borderColor: colors.brandGreen,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 45,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  minimizedImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  minimizedDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandGreen,
    borderWidth: 1.5,
    borderColor: "#0F172A",
  },
});
