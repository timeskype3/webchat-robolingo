"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { Alert, Center, Flex, Loader, Splitter } from "@mantine/core";

import { ConversationList } from "@/components/chat/ConversationList";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { HeaderSection } from "@/components/chat/HeaderSection";
import { auth } from "@/lib/firebase-client";
import { useConversations } from "@/hooks/useConversations";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSendMessage } from "@/hooks/useSendMessage";

export default function ChatPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const {
    conversations,
    isRoomsLoading,
    isLoadingMore,
    hasMore: hasMoreRooms,
    loadMore,
    loadError: roomsLoadError,
  } = useConversations({ user, onError: setError });
  const {
    messages,
    isLoading: isMessagesLoading,
    isLoadingOlder,
    hasMore,
    loadOlder,
    loadError,
  } = useChatMessages({
    user,
    selectedId,
    onError: setError,
  });
  const selected = conversations.find((item) => item.id === selectedId);

  const { draft, setDraft, isSendLoading, handleSend } = useSendMessage({
    user,
    selected,
    onError: setError,
  });

  // Check authorization
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);

      if (!currentUser) {
        setSelectedId(null);
        router.replace("/login");
      }
    });
  }, [router]);

  const selectConversation = useCallback(
    (id: string) => {
      if (id === selectedId) return;

      setDraft("");
      setError("");
      setSelectedId(id);
    },
    [selectedId, setDraft],
  );

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch {
      setError("Something went wrong, please sign out again");
    }
  }

  if (!authReady || !user) {
    return (
      <Center h="100dvh">
        <Loader />
      </Center>
    );
  }

  return (
    <Flex h="100dvh" direction="column">
      <HeaderSection title="Robolingo WebChat" onLogout={handleLogout} />
      {error && (
        <Alert
          variant="light"
          color="red"
          p={10}
          withCloseButton
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Flex flex={1} mih={0}>
        <Splitter w="100%" mih={0} handleColor="gray.2">
          <Splitter.Pane
            defaultSize={30}
            min={20}
            max={50}
            miw={0}
            style={{ overflow: "hidden" }}
          >
            <ConversationList
              conversations={conversations}
              isLoadingMore={isLoadingMore}
              hasMore={hasMoreRooms}
              loadMore={loadMore}
              loadError={roomsLoadError}
              isLoading={isRoomsLoading}
              selectedId={selectedId}
              onSelectConversation={selectConversation}
            />
          </Splitter.Pane>
          <Splitter.Pane
            defaultSize={70}
            min={50}
            miw={0}
            style={{ display: "flex", overflow: "hidden" }}
          >
            <ChatRoom
              key={selectedId ?? "empty"}
              isLoadingOlder={isLoadingOlder}
              hasMore={hasMore}
              loadOlder={loadOlder}
              loadError={loadError}
              selectedConversation={selected}
              messages={messages}
              draft={draft}
              isMessagesLoading={isMessagesLoading}
              isSendLoading={isSendLoading}
              onSetDraft={setDraft}
              onSendMessage={handleSend}
            />
          </Splitter.Pane>
        </Splitter>
      </Flex>
    </Flex>
  );
}
