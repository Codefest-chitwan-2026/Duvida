"use client";

import { useState } from "react";
import { 
  MOCK_QUESTS, 
  type Quest 
} from "@duvidha/shared";
import { 
  Award, 
  Leaf, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Plus, 
  Sparkles,
  ShieldCheck,
  Calendar
} from "lucide-react";

interface QuestProofSubmission {
  id: string;
  questId: string;
  questTitle: string;
  citizenName: string;
  citizenPoints: number;
  description: string;
  photoUrl: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

const MOCK_PROOFS: QuestProofSubmission[] = [
  {
    id: "proof-01",
    questId: "quest-01",
    questTitle: "Clean Park Community Sweep",
    citizenName: "Rohan Shrestha",
    citizenPoints: 450,
    description: "Collected 4 bags of plastic containers and food packaging near the East Gazebo of Cubbon Park.",
    photoUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=60",
    submittedAt: "2026-08-14T07:30:00Z",
    status: "pending",
  },
  {
    id: "proof-02",
    questId: "quest-02",
    questTitle: "Neighborhood Light Watch",
    citizenName: "Priya Patel",
    citizenPoints: 820,
    description: "Audited 5 lamps on 4th Cross Road; verified solar cells and uploaded light intensity readings.",
    photoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=60",
    submittedAt: "2026-08-14T08:10:00Z",
    status: "pending",
  },
];

export default function QuestsModerationPage() {
  const [quests, setQuests] = useState<Quest[]>(MOCK_QUESTS);
  const [proofs, setProofs] = useState<QuestProofSubmission[]>(MOCK_PROOFS);
  const [notification, setNotification] = useState<string | null>(null);

  const handleApproveProof = (id: string, citizenName: string, points: number) => {
    setProofs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "approved" as const } : p))
    );
    setNotification(`Approved proof #${id}. Awarded +${points} Green Points & XP to ${citizenName}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRejectProof = (id: string) => {
    setProofs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "rejected" as const } : p))
    );
    setNotification(`Proof #${id} rejected. Citizen notified.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Citizen Quests & Proof Moderation</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Audit participatory civic missions, approve photographic proofs, and issue voucher-based green incentives.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          <span>Create New Ward Quest</span>
        </button>
      </div>

      {notification && (
        <div style={{
          padding: "12px 18px",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          borderRadius: "var(--radius-md)",
          fontSize: "0.85rem",
          fontWeight: "600",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Active Quests Cards */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "14px" }}>
        Active Civic Challenges
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "32px" }}>
        {quests.map((quest) => {
          const progressPercent = Math.round((quest.completedCount / quest.targetCount) * 100);
          return (
            <div key={quest.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="flex-between">
                <span className="badge" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                  <Leaf size={12} />
                  <span>{quest.category}</span>
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} />
                  <span>Expires {new Date(quest.expiresAt).toLocaleDateString()}</span>
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#ffffff", marginBottom: "6px" }}>
                  {quest.title}
                </h3>
                <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  {quest.description}
                </p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex-between" style={{ fontSize: "0.78rem", marginBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Completion Progress</span>
                  <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                    {quest.completedCount} / {quest.targetCount} citizens ({progressPercent}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: "999px" }} />
                </div>
              </div>

              {/* Reward Highlights */}
              <div className="flex-between" style={{ paddingTop: "12px", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem" }}>
                <span style={{ color: "#fbbf24", fontWeight: "700" }}>
                  +{quest.pointsReward} Points / +{quest.xpReward} XP
                </span>
                <span style={{ color: "#34d399", fontWeight: "600" }}>
                  ~{quest.co2SavedKg} kg CO₂ saved
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proof Review Queue */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "14px" }}>
        Citizen Proof Submissions Pending Verification
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {proofs.map((proof) => (
          <div
            key={proof.id}
            className="card"
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: "20px",
              backgroundColor: "var(--bg-surface-elevated)",
            }}
          >
            {/* Left Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="flex-between">
                <span className="badge" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                  {proof.questTitle}
                </span>
                <span className="badge" style={{
                  backgroundColor: proof.status === "approved" ? "rgba(16, 185, 129, 0.15)" : proof.status === "rejected" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                  color: proof.status === "approved" ? "#34d399" : proof.status === "rejected" ? "#f87171" : "#fbbf24"
                }}>
                  {proof.status.toUpperCase()}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Submitted by: </span>
                <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{proof.citizenName}</strong>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                  (Current balance: {proof.citizenPoints} pts)
                </span>
              </div>

              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                "{proof.description}"
              </p>

              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Timestamp: {new Date(proof.submittedAt).toLocaleDateString()} {new Date(proof.submittedAt).toLocaleTimeString()}
              </div>

              {/* Action Buttons */}
              {proof.status === "pending" && (
                <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "10px" }}>
                  <button
                    onClick={() => handleApproveProof(proof.id, proof.citizenName, 150)}
                    className="btn btn-success btn-sm"
                  >
                    <CheckCircle2 size={15} />
                    <span>Approve & Credit Points</span>
                  </button>
                  <button
                    onClick={() => handleRejectProof(proof.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: "#f87171" }}
                  >
                    <XCircle size={15} />
                    <span>Reject Proof</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Photo Verification */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                Citizen Photographic Evidence
              </div>
              <div style={{
                height: "160px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid var(--border-color)",
                backgroundImage: `url(${proof.photoUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#1e293b"
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
