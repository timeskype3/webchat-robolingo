"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { Message } from "@/types/message-client";

interface UseChatMessagesParams {
  user: User | null;
  selectedId: string | null;
  onError: (message: string) => void;
}

export function useChatMessages({
  user,
  selectedId,
  onError,
}: Readonly<UseChatMessagesParams>) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  useEffect(() => {
    if (!user || !selectedId) return;

    const messagesQuery = query(
      collection(db, "conversations", selectedId, "messages"),
      orderBy("sentAt", "desc"),
      limit(50),
    );

    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Message[];

        items.reverse();
        setMessages(items);
        setIsMessagesLoading(false);
      },
      () => {
        setMessages([]);
        setIsMessagesLoading(false);
        onError("Something went wrong: can't get messages");
      },
    );
  }, [user, selectedId, onError]);

  const resetMessages = useCallback((isLoading = false) => {
    setMessages([]);
    setIsMessagesLoading(isLoading);
  }, []);

  return { messages, isMessagesLoading, resetMessages };
}
