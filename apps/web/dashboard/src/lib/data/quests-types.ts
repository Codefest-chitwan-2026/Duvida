// Data contract for the Quest Verification section (sidebar: "Quests").
//
// IMPORTANT — read before wiring this up to Supabase:
// The verification queue is sourced from `quest_participants`, NOT from
// `quests`. A row in `quests` is only an AI-generated template; it becomes
// verification-worthy only once a citizen has accepted it (a
// `quest_participants` row exists) and submitted proof
// (`quest_participants.status = 'submitted'`). See the query contract in
// quests-provider.ts for the exact join + filter to run against Supabase.
//
// The Row types below mirror the Supabase columns 1:1 (same names, same
// nullability) so a `supabase-provider.ts` can `select()` them directly and
// feed them into `toVerificationItem()` with no relabeling.

export type QuestParticipantStatus = "joined" | "in_progress" | "submitted" | "completed" | "rejected";

export interface QuestRow {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  points_reward: number;
  status: "active" | "completed" | string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  created_by: string;
  created_at: string;
  // NOT in the originally supplied column list. The verification detail
  // view needs the source issue to pull the "before" photo
  // (issues -> issue_media.storage_path), so some FK from quest back to the
  // issue it was generated from has to exist. Confirm the real column name
  // (e.g. `source_issue_id`) with the backend before implementing
  // supabase-provider.ts — this is a placeholder guess, not a verified schema field.
  source_issue_id: string | null;
}

export interface QuestParticipantRow {
  id: string;
  quest_id: string;
  user_id: string;
  status: QuestParticipantStatus;
  progress_percent: number;
  proof_media_path: string | null; // AFTER image
  points_awarded: number | null;
  joined_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  full_name: string;
  username: string;
  role: string;
}

export interface IssueRow {
  id: string;
  reporter_id: string;
  category_id: string;
  title: string;
  description: string;
  status: string;
  severity: "low" | "medium" | "high";
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  created_at: string;
}

export interface IssueMediaRow {
  id: string;
  issue_id: string;
  uploaded_by: string;
  media_type: "image" | "video";
  storage_path: string; // BEFORE image
  thumbnail_path: string | null;
  caption: string | null;
  created_at: string;
}

// Flattened shape the UI actually renders. Produced by joining the four
// tables above the same way the real verification queue query will.
export interface QuestVerificationItem {
  participantId: string;
  questId: string;
  questTitle: string;
  questDescription: string;
  questType: string;
  userId: string;
  userName: string;
  reward: number;
  status: QuestParticipantStatus;
  progressPercent: number;
  submittedAgo: string;
  beforeImageUrl: string | null; // issues -> issue_media.storage_path
  afterImageUrl: string | null; // quest_participants.proof_media_path
  address: string | null;
  city: string | null;
}

export interface QuestVerificationProvider {
  source: "mock" | "supabase";
  getVerificationQueue(): Promise<QuestVerificationItem[]>;
  verify(participantId: string): Promise<QuestVerificationItem>;
  reject(participantId: string): Promise<QuestVerificationItem>;
}
