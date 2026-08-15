import { useRouter } from "expo-router";

import { LoginScreen } from "@/features/auth/LoginScreen";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  return (
    <LoginScreen
      onBack={() => router.back()}
      onLogIn={signIn}
      onSignUp={() => router.push("/register")}
    />
  );
}
