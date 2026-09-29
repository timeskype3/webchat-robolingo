"use client";

import { useRef, useCallback, useLayoutEffect } from "react";
import type { Message } from "@/types/message-client";

interface Params {
  messages: Message[];
  isMessagesLoading?: boolean;
  isLoadingOlder: boolean;
}

export function useChatScroll({ messages, isMessagesLoading, isLoadingOlder }: Readonly<Params>) {
  const viewport = useRef<HTMLDivElement>(null);
  const position = useRef<{
    firstId?: string;
    anchorId?: string;
    offset: number;
    atBottom: boolean;
    initialized: boolean;
  }>({ offset: 0, atBottom: true, initialized: false });

  const rememberPosition = useCallback(() => {
    const root = viewport.current;
    if (!root) return;
    const rootTop = root.getBoundingClientRect().top;
    const anchor = [
      ...root.querySelectorAll<HTMLElement>("[data-message-id]"),
    ].find((element) => element.getBoundingClientRect().bottom > rootTop);
    position.current.anchorId = anchor?.dataset.messageId;
    position.current.offset = anchor
      ? anchor.getBoundingClientRect().top - rootTop
      : 0;
    position.current.atBottom =
      root.scrollHeight - root.scrollTop - root.clientHeight < 80;
  }, []);

  useLayoutEffect(() => {
    const root = viewport.current;
    if (!root || isMessagesLoading || messages.length === 0) return;
    const previous = position.current;
    if (!previous.initialized) {
      root.scrollTop = root.scrollHeight;
      previous.initialized = true;
    } else if (
      (previous.firstId !== messages[0]?.id || !previous.atBottom) &&
      previous.anchorId
    ) {
      const anchor = [
        ...root.querySelectorAll<HTMLElement>("[data-message-id]"),
      ].find((element) => element.dataset.messageId === previous.anchorId);
      if (anchor)
        root.scrollTop +=
          anchor.getBoundingClientRect().top -
          root.getBoundingClientRect().top -
          previous.offset;
    } else if (previous.atBottom) {
      root.scrollTop = root.scrollHeight;
    }
    previous.firstId = messages[0]?.id;
    rememberPosition();
  }, [messages, isMessagesLoading, isLoadingOlder, rememberPosition]);

  return { viewport, rememberPosition };
}
