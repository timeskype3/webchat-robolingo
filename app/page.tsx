"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { Alert, Center, Flex, Loader } from "@mantine/core";

import { ConversationList } from "@/components/chat/ConversationList";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { HeaderSection } from "@/components/chat/HeaderSection";
import { auth } from "@/lib/firebase-client";
import { useConversations } from "@/hooks/useConversations";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSendMessage } from "@/hooks/useSendMessage";

export default function ChatPage() {
  const router = useRouter();
  const viewport = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const { conversations, isRoomsLoading, clearConversations } =
    useConversations({ user, onError: setError });
  const { messages, isMessagesLoading, resetMessages } =
    useChatMessages({ user, selectedId, onError: setError });
  const selected = conversations.find((item) => item.id === selectedId);

  const { draft, setDraft, isSendLoading, handleSend } =
    useSendMessage({ user, selected, onError: setError });

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);

      if (!currentUser) {
        clearConversations();
        resetMessages();
        setSelectedId(null);
        router.replace("/login");
      }
    });
  }, [router, clearConversations, resetMessages]);

  useEffect(() => {
    const element = viewport.current;

    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  function selectConversation(id: string) {
    if (id === selectedId) return;

    resetMessages(true);
    setDraft("");
    setError("");
    setSelectedId(id);
  }

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
      <HeaderSection title="Robolingo Webchat" onLogout={handleLogout} />
      {error && (
        <Alert variant="light" color="blue">
          {error}
        </Alert>
      )}

      <Flex flex={1} mih={0}>
        {/* <Splitter> */}
        {/* <Splitter.Pane defaultSize={50} min={20} max={60}> */}
        <ConversationList
          conversations={conversations}
          isLoading={isRoomsLoading}
          selectedId={selectedId}
          onSelectConversation={selectConversation}
        />
        {/* </Splitter.Pane> */}
        {/* <Splitter.Pane defaultSize={50} min={20} style={{ height: "100%" }}> */}
        <ChatRoom
          selectedConversation={selected}
          messages={messages}
          draft={draft}
          viewport={viewport}
          isMessagesLoading={isMessagesLoading}
          isSendLoading={isSendLoading}
          onSetDraft={setDraft}
          onSendMessage={handleSend}
        />
        {/* </Splitter.Pane> */}
        {/* </Splitter> */}
      </Flex>
    </Flex>
  );
}
