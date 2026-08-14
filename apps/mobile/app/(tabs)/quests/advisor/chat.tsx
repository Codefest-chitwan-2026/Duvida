import { useRouter } from "expo-router";

import { AIChatScreen } from "@/features/quests/AIChatScreen";

export default function AIChatRoute() {
  const router = useRouter();

  return (
    <AIChatScreen
      onBack={() => router.back()}
      onGenerateQuests={() => router.push("/quests/advisor/recommended")}
    />
  );
}
