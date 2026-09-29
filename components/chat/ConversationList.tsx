"use client";

import { memo, useRef } from "react";
import { Conversation } from "@/types/message-client";
import {
  Button,
  Avatar,
  Box,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";

import { useScrollSentinel } from "@/hooks/useScrollSentinel";

interface ConversationListProps {
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  loadError: boolean;
  conversations: Conversation[];
  isLoading?: boolean;
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ConversationList = memo(function ConversationList(
  props: Readonly<ConversationListProps>,
) {
  const {
    isLoadingMore,
    hasMore,
    loadMore,
    loadError,
    conversations,
    isLoading = true,
    selectedId,
    onSelectConversation: handleSelectConversation,
  } = props;
  const viewport = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  useScrollSentinel({
    viewport,
    sentinel,
    enabled: !isLoading && !isLoadingMore && hasMore && !loadError,
    loadMore,
    direction: "bottom",
    itemCount: conversations.length,
  });
  return (
    <ScrollArea
      viewportRef={viewport}
      w="100%"
      h="100%"
      bg="white"
      style={{
        flexShrink: 0,
        borderRight: "1px solid var(--mantine-color-gray-2)",
      }}
    >
      <Stack gap="xs" p="sm">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" p="xs">
          Conversations
        </Text>
        {isLoading && <Loader size="sm" mx="auto" />}

        {!isLoading && conversations.length === 0 && (
          <Text c="dimmed" size="sm" p="sm">
            No chat, please try to send message to Line OA
          </Text>
        )}

        {conversations.map((conversation) => (
          <UnstyledButton
            key={conversation.id}
            p="sm"
            onClick={() => handleSelectConversation(conversation.id)}
            className="chat-conversation"
            aria-current={selectedId === conversation.id ? "true" : undefined}
          >
            <Group wrap="nowrap">
              <Avatar
                src={conversation.profile?.pictureUrl}
                radius="xl"
                color="lineGreen"
              />
              <Box miw={0}>
                <Text fw={600} truncate>
                  {conversation.profile?.displayName || conversation.userId}
                </Text>
                <Text size="sm" c="dimmed" truncate>
                  {conversation.lastMessage}
                </Text>
              </Box>
            </Group>
          </UnstyledButton>
        ))}
        <div ref={sentinel} style={{ height: 1 }} aria-hidden="true" />
        {isLoadingMore && <Loader size="sm" mx="auto" />}
        {loadError && (
          <Button
            variant="subtle"
            onClick={() => void loadMore()}
            loading={isLoadingMore}
          >
            Retry loading conversations
          </Button>
        )}
      </Stack>
    </ScrollArea>
  );
});
