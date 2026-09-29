"use client";

import { memo } from "react";
import { Conversation } from "@/types/message-client";
import {
  Avatar,
  Box,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading?: boolean;
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ConversationList = memo(function ConversationList(props: Readonly<ConversationListProps>) {
  const {
    conversations,
    isLoading = true,
    selectedId,
    onSelectConversation: handleSelectConversation,
  } = props;
  return (
    <ScrollArea
      w={{ base: 130, sm: 340 }}
      bg="white"
      style={{ flexShrink: 0, borderRight: "1px solid var(--mantine-color-gray-2)" }}
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
              <Avatar src={conversation.profile?.pictureUrl} radius="xl" color="lineGreen" />
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
      </Stack>
    </ScrollArea>
  );
});
