import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { IssueDetailScreen } from "@/features/map/IssueDetailScreen";
import { mockIssues } from "@/features/map/mockIssues";

export default function IssueDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const issue = mockIssues.find((entry) => entry.id === id);

  if (!issue) {
    return (
      <PlaceholderScreen title="Issue not found" subtitle="This report may have been resolved or removed." />
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <IssueDetailScreen
        issue={issue}
        onBack={() => router.back()}
        onReportSimilar={() => router.push("/report/new")}
      />
    </>
  );
}
