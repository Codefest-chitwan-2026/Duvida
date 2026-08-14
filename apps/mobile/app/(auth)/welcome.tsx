import { useRouter } from "expo-router";

import { WelcomeScreen } from "@/features/auth/WelcomeScreen";
import { useAuth } from "@/lib/auth";

export default function Welcome() {
  const router = useRouter();
  const { signIn } = useAuth();

  return <WelcomeScreen onGetStarted={signIn} onLogIn={() => router.push("/login")} />;
}
