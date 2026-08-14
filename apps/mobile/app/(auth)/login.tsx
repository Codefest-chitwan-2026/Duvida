import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { LoginScreen } from "@/features/auth/LoginScreen";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const { signIn, signUp, error, clearError } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const initialMode = modeParam === "signup" ? "signup" : "login";

  const handleLogIn = async (email: string, password: string) => {
    setSubmitting(true);
    await signIn(email, password);
    setSubmitting(false);
  };

  const handleSignUp = async (email: string, password: string) => {
    setSubmitting(true);
    await signUp(email, password);
    setSubmitting(false);
  };

  return (
    <LoginScreen
      initialMode={initialMode}
      onBack={() => router.back()}
      onLogIn={handleLogIn}
      onSignUp={handleSignUp}
      submitting={submitting}
      error={error}
      onModeChange={clearError}
    />
  );
}
