import { useLocalSearchParams, useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { ActiveQuestScreen } from "@/features/quests/ActiveQuestScreen";
import { getQuestById } from "@/features/quests/mockQuests";

export default function ActiveQuestRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const quest = getQuestById(id);

  if (!quest) {
    return <PlaceholderScreen title="Quest not found" subtitle="This quest is no longer available." />;
  }

  return (
    <ActiveQuestScreen
      quest={quest}
      onBack={() => router.back()}
      onSubmitProof={() => router.push({ pathname: "/quests/[id]/submit-proof", params: { id: quest.id } })}
    />
  );
}
