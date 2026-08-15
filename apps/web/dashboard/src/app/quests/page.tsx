"use client";

import { useEffect, useState } from "react";
import { useQuestVerification } from "@/hooks/useQuestVerification";
import { LoadingState, EmptyState, ErrorState } from "@/components/DashboardStates";
import { QuestVerificationList } from "@/components/QuestVerificationList";
import { QuestVerificationDetail } from "@/components/QuestVerificationDetail";

export default function QuestVerificationPage() {
  const { state, actioningId, reload, verify, reject } = useQuestVerification();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (state.status !== "ready") return;
    const stillExists = state.items.some((item) => item.participantId === selectedId);
    if (!stillExists) setSelectedId(state.items[0]?.participantId ?? null);
  }, [state, selectedId]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={reload} />;
  if (state.status === "empty") {
    return <EmptyState title="No submissions waiting on verification" message="Once a citizen accepts a quest and submits proof, it will show up here for review." />;
  }

  const selectedItem = state.items.find((item) => item.participantId === selectedId) ?? null;

  return (
    <div className="page-container">
      <div style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Quest Verification</h1>
        <p className="page-subtitle">Review proof submitted for accepted quests and approve or reject completion.</p>
      </div>

      <div className="quest-verification-grid">
        <QuestVerificationList items={state.items} selectedId={selectedId} onSelect={setSelectedId} />
        <QuestVerificationDetail
          item={selectedItem}
          isActioning={actioningId !== null}
          onVerify={verify}
          onReject={reject}
        />
      </div>
    </div>
  );
}
