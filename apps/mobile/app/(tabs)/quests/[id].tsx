import { useLocalSearchParams, useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { getQuestById } from "@/features/quests/mockQuests";
import { QuestDetailScreen } from "@/features/quests/QuestDetailScreen";

export default function QuestDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const quest = getQuestById(id);

  if (!quest) {
    return <PlaceholderScreen title="Quest not found" subtitle="This quest is no longer available." />;
  }

  return (
    <QuestDetailScreen
      quest={quest}
      onBack={() => router.back()}
      onStartQuest={() => router.push({ pathname: "/quests/[id]/active", params: { id: quest.id } })}
    />
  );
}
