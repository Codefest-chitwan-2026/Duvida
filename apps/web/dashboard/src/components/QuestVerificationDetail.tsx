import { AlertCircle, Award, Check, Clock3, ImageOff, MapPin, ShieldCheck, UserRound, X } from "lucide-react";
import type { QuestVerificationItem } from "@/lib/data/quests-types";

function humanizeQuestType(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ProofTile({ label, helper, src, tone }: { label: string; helper: string; src: string | null; tone: "before" | "after" }) {
  return (
    <figure className="quest-proof-tile">
      <figcaption>
        <span className={`quest-proof-marker quest-proof-marker-${tone}`} aria-hidden="true" />
        <span>
          <strong>{label}</strong>
          <small>{helper}</small>
        </span>
      </figcaption>
      <div className="quest-proof-image">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`${label} evidence`} />
        ) : (
          <div className="quest-proof-placeholder">
            <span><ImageOff size={21} /></span>
            <strong>Image unavailable</strong>
            <small>No media is attached to this demo submission.</small>
          </div>
        )}
      </div>
    </figure>
  );
}

export function QuestVerificationDetail({
  item,
  isActioning,
  onVerify,
  onReject,
}: {
  item: QuestVerificationItem | null;
  isActioning: boolean;
  onVerify: (participantId: string) => void;
  onReject: (participantId: string) => void;
}) {
  if (!item) {
    return (
      <section className="card quest-detail-empty">
        <span><ShieldCheck size={25} /></span>
        <h2>Select a submission</h2>
        <p>Choose a submitted quest from the review queue to inspect its evidence and details.</p>
      </section>
    );
  }

  return (
    <article className="card quest-detail-card">
      <header className="quest-detail-header">
        <div className="quest-detail-heading">
          <div className="quest-detail-badges">
            <span className="quest-type-badge">{humanizeQuestType(item.questType)}</span>
            <span className="quest-status-badge"><span />Submitted</span>
          </div>
          <h2>{item.questTitle}</h2>
          {item.questDescription && <p>{item.questDescription}</p>}
        </div>
        <div className="quest-reward-block">
          <span><Award size={16} /></span>
          <strong>{item.reward}</strong>
          <small>token reward</small>
        </div>
      </header>

      <section className="quest-review-meta" aria-label="Submission information">
        <div>
          <span className="quest-meta-icon"><UserRound size={16} /></span>
          <span><small>Submitted by</small><strong>{item.userName}</strong></span>
        </div>
        <div>
          <span className="quest-meta-icon"><Clock3 size={16} /></span>
          <span><small>Submitted</small><strong>{item.submittedAgo}</strong></span>
        </div>
        <div>
          <span className="quest-meta-icon"><MapPin size={16} /></span>
          <span><small>Location</small><strong>{item.address ?? "Not provided"}{item.city ? `, ${item.city}` : ""}</strong></span>
        </div>
      </section>

      <section className="quest-evidence-section">
        <div className="quest-section-heading">
          <div>
            <p className="quest-panel-kicker">Evidence comparison</p>
            <h3>Before and after</h3>
          </div>
          <span>2 evidence slots</span>
        </div>
        <div className="quest-proof-grid">
          <ProofTile label="Before" helper="Original issue" src={item.beforeImageUrl} tone="before" />
          <ProofTile label="After" helper="Citizen proof" src={item.afterImageUrl} tone="after" />
        </div>
      </section>

      <div className="quest-review-note">
        <AlertCircle size={17} />
        <p><strong>Review carefully.</strong> Confirm that the after evidence matches the location and shows meaningful completion before releasing tokens.</p>
      </div>

      <footer className="quest-action-bar">
        <div className="quest-submission-id">
          <small>Submission ID</small>
          <span className="mono">{item.participantId}</span>
        </div>
        <div className="quest-action-buttons">
          <button
            type="button"
            className="btn quest-reject-button"
            disabled={isActioning}
            onClick={() => onReject(item.participantId)}
          >
            <X size={16} />
            Reject
          </button>
          <button
            type="button"
            className="btn btn-primary quest-verify-button"
            disabled={isActioning}
            onClick={() => onVerify(item.participantId)}
          >
            <Check size={17} />
            {isActioning ? "Processing…" : "Approve & reward"}
          </button>
        </div>
      </footer>
    </article>
  );
}
