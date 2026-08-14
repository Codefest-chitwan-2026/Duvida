import { Stack, useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { getQuestById } from "@/features/quests/mockQuests";
import { SubmitProofScreen } from "@/features/quests/SubmitProofScreen";

export default function QuestSubmitProofRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quest = getQuestById(id);

  if (!quest) {
    return <PlaceholderScreen title="Quest not found" subtitle="This quest is no longer available." />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SubmitProofScreen quest={quest} coinBalance={2450} />
    </>
  );
}
