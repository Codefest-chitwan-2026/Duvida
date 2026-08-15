import { Stack, useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { SubmitProofScreen } from "@/features/quests/SubmitProofScreen";

export default function QuestSubmitProofRoute() {
  const { id, title, description, points_reward, progress_percent } = useLocalSearchParams<{
    id: string;
    title?: string;
    description?: string;
    points_reward?: string;
    progress_percent?: string;
  }>();

  if (!id) {
    return <PlaceholderScreen title="Quest not found" subtitle="This quest is no longer available." />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SubmitProofScreen
        questId={id}
        title={title ?? "Untitled quest"}
        description={description ?? ""}
        tokens={points_reward ? Number(points_reward) : 0}
        progressPercent={progress_percent ? Number(progress_percent) : 0}
        coinBalance={2450}
      />
    </>
  );
}
