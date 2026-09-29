"use client";

import { useState, type SubmitEvent } from "react";
import type { User } from "firebase/auth";
import type { Conversation } from "@/types/message-client";

interface UseSendMessageParams {
  user: User | null;
  selected: Conversation | undefined;
  onError: (message: string) => void;
}

export function useSendMessage({
  user,
  selected,
  onError,
}: Readonly<UseSendMessageParams>) {
  const [draft, setDraft] = useState("");
  const [isSendLoading, setIsSendLoading] = useState(false);

  async function handleSend(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !selected || !draft.trim() || isSendLoading) return;

    setIsSendLoading(true);
    onError("");

    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selected.userId,
          text: draft.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "The message failed to sent");
      }

      setDraft("");
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "The message failed to sent",
      );
    } finally {
      setIsSendLoading(false);
    }
  }

  return { draft, setDraft, isSendLoading, handleSend };
}
