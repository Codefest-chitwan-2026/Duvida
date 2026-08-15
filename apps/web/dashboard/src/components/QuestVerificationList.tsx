import { Award, ChevronRight, Clock3, Search, UserRound } from "lucide-react";
import type { QuestVerificationItem } from "@/lib/data/quests-types";

function humanizeQuestType(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function QuestVerificationList({
  items,
  totalCount,
  selectedId,
  query,
  onQueryChange,
  onSelect,
}: {
  items: QuestVerificationItem[];
  totalCount: number;
  selectedId: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (participantId: string) => void;
}) {
  return (
    <aside className="card quest-queue-card" aria-label="Submitted quests">
      <div className="quest-queue-heading">
        <div>
          <p className="quest-panel-kicker">Review queue</p>
          <h2>Submitted quests</h2>
        </div>
        <span className="quest-pending-count" aria-label={`${totalCount} pending submissions`}>
          {totalCount}
        </span>
      </div>

      <label className="quest-search">
        <Search size={15} aria-hidden="true" />
        <span className="sr-only">Search submissions</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search quest or citizen"
        />
      </label>

      <div className="quest-submission-list">
        {items.length === 0 ? (
          <div className="quest-search-empty">
            <Search size={20} />
            <p>No submissions match “{query}”</p>
            <button type="button" onClick={() => onQueryChange("")}>Clear search</button>
          </div>
        ) : (
          items.map((item) => {
            const isActive = item.participantId === selectedId;
            return (
              <button
                key={item.participantId}
                type="button"
                onClick={() => onSelect(item.participantId)}
                className={`quest-submission ${isActive ? "quest-submission-active" : ""}`}
                aria-pressed={isActive}
              >
                <span className="quest-submission-topline">
                  <span className="quest-type-badge">{humanizeQuestType(item.questType)}</span>
                  <span className="quest-submission-time"><Clock3 size={12} />{item.submittedAgo}</span>
                </span>

                <span className="quest-submission-title">{item.questTitle}</span>

                <span className="quest-submission-footer">
                  <span className="quest-citizen">
                    <span className="quest-avatar" aria-hidden="true">{initials(item.userName)}</span>
                    <span><UserRound size={12} />{item.userName}</span>
                  </span>
                  <span className="quest-list-reward"><Award size={13} />{item.reward}</span>
                  <ChevronRight className="quest-list-chevron" size={16} aria-hidden="true" />
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
