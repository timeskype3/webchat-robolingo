"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { Conversation } from "@/types/message-client";

const PAGE_SIZE = 10;
const EMPTY_conversations: Conversation[] = [];

interface Params {
  user: User | null;
  onError: (message: string) => void;
}

export function useConversations({ user, onError }: Readonly<Params>) {
  const key = user?.uid ?? "";
  const [data, setData] = useState({
    key,
    items: EMPTY_conversations,
    loading: Boolean(user),
    loadingMore: false,
    hasMore: false,
    loadError: false,
  });
  const fetchNextPage = useRef<{
    key: string;
    run: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    let loadingMore = false;
    let hasMore = false;
    let cursor: QueryDocumentSnapshot | undefined;
    const documents = new Map<string, QueryDocumentSnapshot>();
    const source = collection(db, "conversations");

    function updateItems() {
      const sorted = [...documents.values()].sort((a, b) => {
        const left = a.get("lastMessageAt");
        const right = b.get("lastMessageAt");
        return (
          (right?.seconds ?? 0) - (left?.seconds ?? 0) || // Check seconds
          (right?.nanoseconds ?? 0) - (left?.nanoseconds ?? 0) || // Check nano seconds
          (a.id < b.id ? 1 : a.id > b.id ? -1 : 0)
        ); // Check document ID
      });
      const items = sorted.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as Conversation,
      );
      setData((previous) => ({
        ...previous,
        key,
        items,
        loading: false,
        hasMore,
      }));
    }

    // Firebase calls this listener initially and whenever the latest 10 items change.
    const unsubscribe = onSnapshot(
      query(source, orderBy("lastMessageAt", "desc"), limit(PAGE_SIZE)),
      (snapshot) => {
        if (!active) return;
        if (!cursor) {
          cursor = snapshot.docs.at(-1);
          hasMore = snapshot.size === PAGE_SIZE;
        }
        snapshot.docs.forEach((doc) => documents.set(doc.id, doc));
        updateItems();
      },
      () => {
        if (!active) return;
        setData((previous) => ({ ...previous, key, loading: false }));
        onError("Unable to load conversations. Please try again.");
      },
    );

    async function loadMorePage() {
      if (!active || loadingMore || !hasMore || !cursor) return;
      loadingMore = true;
      setData((previous) => ({
        ...previous,
        loadingMore: true,
        loadError: false,
      }));
      try {
        const snapshot = await getDocs(
          query(
            source,
            orderBy("lastMessageAt", "desc"),
            startAfter(cursor),
            limit(PAGE_SIZE),
          ),
        );
        if (!active) return;
        snapshot.docs.forEach((doc) => {
          if (!documents.has(doc.id)) documents.set(doc.id, doc);
        });
        cursor = snapshot.docs.at(-1) ?? cursor;
        hasMore = snapshot.size === PAGE_SIZE;
        updateItems();
      } catch {
        if (!active) return;
        setData((previous) => ({ ...previous, loadError: true }));
        onError("Unable to load older conversations. Please try again.");
      } finally {
        if (active) {
          loadingMore = false;
          setData((previous) => ({ ...previous, loadingMore: false }));
        }
      }
    }

    fetchNextPage.current = { key, run: loadMorePage };

    return () => {
      active = false;
      unsubscribe();
      fetchNextPage.current = null;
    };
  }, [user, key, onError]);

  const loadMore = useCallback(async () => {
    if (fetchNextPage.current?.key === key) await fetchNextPage.current.run();
  }, [key]);

  if (data.key !== key) {
    setData({
      key,
      items: EMPTY_conversations,
      loading: Boolean(user),
      loadingMore: false,
      hasMore: false,
      loadError: false,
    });
  }

  return {
    conversations: data.items,
    isRoomsLoading: data.loading,
    isLoadingMore: data.loadingMore,
    hasMore: data.hasMore,
    loadError: data.loadError,
    loadMore,
  };
}
