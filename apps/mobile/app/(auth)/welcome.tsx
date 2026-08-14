import { useRouter } from "expo-router";

import { WelcomeScreen } from "@/features/auth/WelcomeScreen";

export default function Welcome() {
  const router = useRouter();

  return (
    <WelcomeScreen
      onGetStarted={() => router.push({ pathname: "/login", params: { mode: "signup" } })}
      onLogIn={() => router.push("/login")}
    />
  );
}
