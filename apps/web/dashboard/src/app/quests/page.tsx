"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, ClipboardCheck, RefreshCw, UsersRound } from "lucide-react";
import { useQuestVerification } from "@/hooks/useQuestVerification";
import { LoadingState, ErrorState } from "@/components/DashboardStates";
import { QuestVerificationList } from "@/components/QuestVerificationList";
import { QuestVerificationDetail } from "@/components/QuestVerificationDetail";

function QuestPageHeader({ pendingCount, onRefresh }: { pendingCount: number; onRefresh: () => void }) {
  return (
    <header className="quest-page-header">
      <div>
        <div className="quest-page-eyebrow">
          <ClipboardCheck size={14} />
          Community operations
        </div>
        <h1 className="page-title">Quest verification</h1>
        <p className="page-subtitle">
          Review citizen evidence, validate completed work, and release rewards.
        </p>
      </div>
      <div className="quest-header-actions">
        <span className="quest-header-status"><span />{pendingCount} pending</span>
        <button type="button" className="btn btn-secondary quest-refresh-button" onClick={onRefresh}>
          <RefreshCw size={15} />
          Refresh queue
        </button>
      </div>
    </header>
  );
}

export default function QuestVerificationPage() {
  const { state, actioningId, reload, verify, reject } = useQuestVerification();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const readyItems = useMemo(() => (state.status === "ready" ? state.items : []), [state]);
  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return readyItems;

    return readyItems.filter((item) =>
      [item.questTitle, item.userName, item.questType, item.address, item.city]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [query, readyItems]);

  useEffect(() => {
    if (state.status !== "ready") return;
    const stillVisible = visibleItems.some((item) => item.participantId === selectedId);
    if (!stillVisible) setSelectedId(visibleItems[0]?.participantId ?? null);
  }, [selectedId, state.status, visibleItems]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={reload} />;

  if (state.status === "empty") {
    return (
      <main className="page-container quest-page">
        <QuestPageHeader pendingCount={0} onRefresh={reload} />
        <section className="card quest-empty-state">
          <span className="quest-empty-icon" aria-hidden="true">
            <CheckCircle2 size={27} />
          </span>
          <h2>Verification queue cleared</h2>
          <p>There are no submitted quests waiting for review. New citizen submissions will appear here.</p>
          <button type="button" className="btn btn-secondary" onClick={reload}>
            <RefreshCw size={15} />
            Check for submissions
          </button>
        </section>
      </main>
    );
  }

  const selectedItem = readyItems.find((item) => item.participantId === selectedId) ?? null;
  const rewardsPending = readyItems.reduce((total, item) => total + item.reward, 0);
  const citizenCount = new Set(readyItems.map((item) => item.userId)).size;

  return (
    <main className="page-container quest-page">
      <QuestPageHeader pendingCount={readyItems.length} onRefresh={reload} />

      <section className="quest-summary-grid" aria-label="Verification queue summary">
        <article className="quest-summary-card">
          <span className="quest-summary-icon quest-summary-icon-amber"><ClipboardCheck size={18} /></span>
          <span>
            <strong>{readyItems.length}</strong>
            <small>Awaiting review</small>
          </span>
        </article>
        <article className="quest-summary-card">
          <span className="quest-summary-icon quest-summary-icon-green"><Award size={18} /></span>
          <span>
            <strong>{rewardsPending}</strong>
            <small>Tokens pending</small>
          </span>
        </article>
        <article className="quest-summary-card">
          <span className="quest-summary-icon quest-summary-icon-blue"><UsersRound size={18} /></span>
          <span>
            <strong>{citizenCount}</strong>
            <small>Citizens in queue</small>
          </span>
        </article>
      </section>

      <section className="quest-verification-grid" aria-label="Quest verification workspace">
        <QuestVerificationList
          items={visibleItems}
          totalCount={readyItems.length}
          selectedId={selectedId}
          query={query}
          onQueryChange={setQuery}
          onSelect={setSelectedId}
        />
        <QuestVerificationDetail
          item={selectedItem}
          isActioning={actioningId !== null}
          onVerify={verify}
          onReject={reject}
        />
      </section>
    </main>
  );
}
