import { useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";

export default function NewReportScreen() {
  const { issueId } = useLocalSearchParams<{ issueId?: string }>();

  return (
    <PlaceholderScreen
      title="New report"
      subtitle={
        issueId
          ? `Report flow for "${issueId}" (location -> details -> evidence) lands here.`
          : "Report flow (location -> details -> evidence) lands here."
      }
    />
  );
}
