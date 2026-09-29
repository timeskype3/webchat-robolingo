"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { Conversation } from "@/types/message-client";

interface UseConversationsParams {
  user: User | null;
  onError: (message: string) => void;
}

export function useConversations({
  user,
  onError,
}: Readonly<UseConversationsParams>) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const roomsQuery = query(
      collection(db, "conversations"),
      orderBy("lastMessageAt", "desc"),
      limit(50),
    );

    return onSnapshot(
      roomsQuery,
      (snapshot) => {
        setConversations(
          snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as Conversation[],
        );
        setIsRoomsLoading(false);
      },
      () => {
        setConversations([]);
        setIsRoomsLoading(false);
        onError("Something went wrong: can't get messages");
      },
    );
  }, [user, onError]);

  const clearConversations = useCallback(() => {
    setConversations([]);
  }, []);

  return { conversations, isRoomsLoading, clearConversations };
}
