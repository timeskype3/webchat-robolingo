"use client";

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

export function ConversationList(props: Readonly<ConversationListProps>) {
  const {
    conversations,
    isLoading = true,
    selectedId,
    onSelectConversation: handleSelectConversation,
  } = props;
  return (
    <ScrollArea
      w={{ base: 130, sm: 300 }}
      style={{ flexShrink: 0, borderRight: "1px solid #ddd" }}
    >
      <Stack gap={4} p="xs">
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
            style={{
              borderRadius: 8,
              background:
                selectedId === conversation.id
                  ? "var(--mantine-color-blue-light)"
                  : undefined,
            }}
          >
            <Group wrap="nowrap">
              <Avatar src={conversation.profile?.pictureUrl} radius="xl" />
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
}
