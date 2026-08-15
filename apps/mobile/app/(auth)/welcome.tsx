import { useRouter } from "expo-router";

import { WelcomeScreen } from "@/features/auth/WelcomeScreen";

export default function Welcome() {
  const router = useRouter();

  return (
    <WelcomeScreen
      onGetStarted={() => router.push("/register")}
      onLogIn={() => router.push("/login")}
    />
  );
}
