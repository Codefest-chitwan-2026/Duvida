import { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/features/auth/theme";

const background = require("@/features/auth/assets/login-background.jpeg");

type AuthMode = "login" | "signup";

type LoginScreenProps = {
  initialMode?: AuthMode;
  onBack?: () => void;
  onLogIn?: (email: string, password: string) => void;
  onSignUp?: (email: string, password: string) => void;
  submitting?: boolean;
  error?: string | null;
  notice?: string | null;
  onModeChange?: (mode: AuthMode) => void;
};

export function LoginScreen({
  initialMode = "login",
  onBack,
  onLogIn,
  onSignUp,
  submitting = false,
  error = null,
  notice = null,
  onModeChange,
}: LoginScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;
  const isSignUp = mode === "signup";

  const toggleMode = () => {
    const next: AuthMode = isSignUp ? "login" : "signup";
    setMode(next);
    onModeChange?.(next);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (isSignUp) {
      onSignUp?.(email, password);
    } else {
      onLogIn?.(email, password);
    }
  };

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <View style={styles.iconBadge}>
                <Ionicons name="leaf" size={26} color={colors.primary} />
              </View>
              <Text style={styles.title}>{isSignUp ? "Create your account" : "Welcome back"}</Text>
              <Text style={styles.subtitle}>
                {isSignUp
                  ? "Join the community effort to build a better city."
                  : "Log in to keep building a better city."}
              </Text>

              <Text style={styles.label}>Email</Text>
              <View style={styles.inputRow}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.subtext}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.subtext}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.subtext}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.subtext}
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="go"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={colors.subtext}
                  />
                </TouchableOpacity>
              </View>

              {!isSignUp && (
                <TouchableOpacity style={styles.forgotLink} hitSlop={8}>
                  <Text style={styles.forgotLinkText}>Forgot password?</Text>
                </TouchableOpacity>
              )}

              {notice && !error && (
                <View style={styles.noticeBox}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.primaryDark} />
                  <Text style={styles.noticeText}>{notice}</Text>
                </View>
              )}

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                activeOpacity={0.85}
                disabled={!canSubmit}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? "Please wait..." : isSignUp ? "Create Account" : "Log In"}
                </Text>
              </TouchableOpacity>

              <View style={styles.signUpRow}>
                <Text style={styles.signUpText}>
                  {isSignUp ? "Already have an account? " : "Don&apos;t have an account? "}
                </Text>
                <TouchableOpacity onPress={toggleMode} hitSlop={8} disabled={submitting}>
                  <Text style={styles.signUpLink}>{isSignUp ? "Log in" : "Sign up"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  backButton: {
    marginTop: 8,
    marginLeft: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { flexGrow: 1, justifyContent: "flex-end" },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E9F9EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink, marginBottom: 4 },
  subtitle: { fontSize: 13.5, color: colors.subtext, marginBottom: 22 },
  label: { fontSize: 13, fontWeight: "600", color: colors.ink, marginBottom: 6, marginTop: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F9FAFB",
  },
  inputIcon: { marginRight: 2 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: colors.ink },
  forgotLink: { alignSelf: "flex-end", marginTop: 12 },
  forgotLinkText: { fontSize: 12.5, color: colors.primaryDark, fontWeight: "600" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
  },
  errorText: { flex: 1, fontSize: 12.5, color: "#DC2626", fontWeight: "600" },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#E9F9EF",
  },
  noticeText: { flex: 1, fontSize: 12.5, color: colors.primaryDark, fontWeight: "600" },
  submitButton: {
    marginTop: 22,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: { backgroundColor: "#A7D9B8" },
  submitButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  signUpRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  signUpText: { fontSize: 13, color: colors.subtext },
  signUpLink: { fontSize: 13, color: colors.primaryDark, fontWeight: "700" },
});
