import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/features/auth/theme";

const background = require("@/features/auth/assets/login-background.jpeg");

type WelcomeScreenProps = {
  onGetStarted?: () => void;
  onLogIn?: () => void;
};

export function WelcomeScreen({ onGetStarted, onLogIn }: WelcomeScreenProps) {
  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onGetStarted}
              activeOpacity={0.9}
            >
              <Ionicons name="leaf" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onLogIn} activeOpacity={0.9}>
              <Ionicons
                name="log-in-outline"
                size={22}
                color={colors.primary}
                style={styles.buttonIcon}
              />
              <Text style={styles.secondaryButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  actions: {
    width: "100%",
    gap: 14,
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  buttonIcon: {
    marginRight: 8,
  },
});
