"use client";

import { useCallback, useEffect, useState } from "react";
import { getQuestVerificationProvider } from "@/lib/data";
import type { QuestVerificationItem } from "@/lib/data/quests-types";

export type QuestVerificationQueryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; items: QuestVerificationItem[] };

export function useQuestVerification() {
  const [state, setState] = useState<QuestVerificationQueryState>({ status: "loading" });
  const [actioningId, setActioningId] = useState<string | null>(null);
  const provider = getQuestVerificationProvider();

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const items = await provider.getVerificationQueue();
      setState(items.length > 0 ? { status: "ready", items } : { status: "empty" });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load the verification queue." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeFromQueue = (participantId: string) => {
    setState((prev) => {
      if (prev.status !== "ready") return prev;
      const remaining = prev.items.filter((item) => item.participantId !== participantId);
      return remaining.length > 0 ? { status: "ready", items: remaining } : { status: "empty" };
    });
  };

  const verify = async (participantId: string) => {
    setActioningId(participantId);
    try {
      await provider.verify(participantId);
      removeFromQueue(participantId);
    } finally {
      setActioningId(null);
    }
  };

  const reject = async (participantId: string) => {
    setActioningId(participantId);
    try {
      await provider.reject(participantId);
      removeFromQueue(participantId);
    } finally {
      setActioningId(null);
    }
  };

  return { state, source: provider.source, actioningId, reload: load, verify, reject };
}
