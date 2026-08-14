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

type RegisterScreenProps = {
  onBack?: () => void;
  onRegister?: (name: string, email: string, password: string) => void;
  onLogIn?: () => void;
};

export function RegisterScreen({ onBack, onRegister, onLogIn }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length > 0;

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
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>Join the community and start reporting.</Text>

              <Text style={styles.label}>Name</Text>
              <View style={styles.inputRow}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.subtext}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={colors.subtext}
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>

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
                  placeholder="Create a password"
                  placeholderTextColor={colors.subtext}
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={() => canSubmit && onRegister?.(name, email, password)}
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

              <TouchableOpacity
                style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                activeOpacity={0.85}
                disabled={!canSubmit}
                onPress={() => onRegister?.(name, email, password)}
              >
                <Text style={styles.submitButtonText}>Create Account</Text>
              </TouchableOpacity>

              <View style={styles.signUpRow}>
                <Text style={styles.signUpText}>Already have an account? </Text>
                <TouchableOpacity onPress={onLogIn} hitSlop={8}>
                  <Text style={styles.signUpLink}>Log in</Text>
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
