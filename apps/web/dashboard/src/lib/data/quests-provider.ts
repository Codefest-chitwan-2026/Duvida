// Development-only mock data. Replace with Supabase data before production.
//
// QUERY CONTRACT for the real supabase-provider.ts:
//
//   quest_participants
//         JOIN quests           ON quests.id = quest_participants.quest_id
//         JOIN profiles         ON profiles.id = quest_participants.user_id
//         LEFT JOIN issues      ON issues.id = quests.source_issue_id
//         LEFT JOIN issue_media ON issue_media.issue_id = issues.id
//   WHERE quest_participants.status = 'submitted'
//
// A quest in `quests` is only a template until a user accepts it — that's
// what creates the `quest_participants` row. Verification only starts once
// the participant submits proof, so `quest_participants.status = 'submitted'`
// is the sole gate for this queue. Never query `quests` directly for this screen.
//
// On Verify, update quest_participants:
//   { status: 'completed', progress_percent: 100, points_awarded: <quests.points_reward>, completed_at: now() }
//   then increment the user's total in `user_points`.
//
// On Reject, update quest_participants:
//   { status: 'rejected', updated_at: now() }
//   'rejected' is not in the four statuses given in the original spec
//   (joined/in_progress/submitted/completed) — confirm the real check
//   constraint on quest_participants.status allows it before wiring this up.

import { MOCK_ISSUES, MOCK_ISSUE_MEDIA, MOCK_PROFILES, MOCK_QUESTS, MOCK_QUEST_PARTICIPANTS } from "@/data/mock-quests-data";
import type { QuestParticipantRow, QuestVerificationItem, QuestVerificationProvider } from "@/lib/data/quests-types";

const SIMULATED_LATENCY_MS = 300;

// Mutable in-memory copy so Verify/Reject in the UI can move rows out of the
// queue during this session, mirroring how a real UPDATE would remove a row
// from the filtered result on next fetch.
const participants: QuestParticipantRow[] = MOCK_QUEST_PARTICIPANTS.map((p) => ({ ...p }));

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function toVerificationItem(p: QuestParticipantRow): QuestVerificationItem {
  const quest = MOCK_QUESTS.find((q) => q.id === p.quest_id);
  const profile = MOCK_PROFILES.find((u) => u.id === p.user_id);
  const issue = quest?.source_issue_id ? MOCK_ISSUES.find((i) => i.id === quest.source_issue_id) : undefined;
  const beforeMedia = issue ? MOCK_ISSUE_MEDIA.find((m) => m.issue_id === issue.id) : undefined;

  return {
    participantId: p.id,
    questId: quest?.id ?? p.quest_id,
    questTitle: quest?.title ?? "Unknown quest",
    questType: quest?.quest_type ?? "general",
    userId: p.user_id,
    userName: profile?.full_name ?? "Unknown user",
    reward: quest?.points_reward ?? 0,
    status: p.status,
    progressPercent: p.progress_percent,
    submittedAgo: timeAgo(p.updated_at),
    beforeImageUrl: beforeMedia?.storage_path || null,
    afterImageUrl: p.proof_media_path || null,
    address: quest?.address ?? null,
    city: quest?.city ?? null,
  };
}

export const mockQuestVerificationProvider: QuestVerificationProvider = {
  source: "mock",

  async getVerificationQueue() {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
    return participants
      .filter((p) => p.status === "submitted")
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .map(toVerificationItem);
  },

  async verify(participantId) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
    const p = participants.find((row) => row.id === participantId);
    if (!p) throw new Error("Participant not found");
    const quest = MOCK_QUESTS.find((q) => q.id === p.quest_id);

    p.status = "completed";
    p.progress_percent = 100;
    p.points_awarded = quest?.points_reward ?? 0;
    p.completed_at = new Date().toISOString();
    p.updated_at = p.completed_at;

    return toVerificationItem(p);
  },

  async reject(participantId) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
    const p = participants.find((row) => row.id === participantId);
    if (!p) throw new Error("Participant not found");

    p.status = "rejected";
    p.updated_at = new Date().toISOString();

    return toVerificationItem(p);
  },
};
