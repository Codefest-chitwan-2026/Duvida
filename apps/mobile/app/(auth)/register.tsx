import { useRouter } from "expo-router";

import { SignupScreen } from "@/features/auth/SignupScreen";

export default function Register() {
  const router = useRouter();

  return (
    <SignupScreen
      onBack={() => router.back()}
      onSignUp={() => router.replace("/login")}
      onLogIn={() => router.replace("/login")}
    />
  );
}
