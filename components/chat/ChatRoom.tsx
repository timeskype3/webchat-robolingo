import {
  Center,
  EmptyState,
  Flex,
  Loader,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { ChatCenteredTextIcon } from "@phosphor-icons/react";
import type { RefObject, SubmitEvent } from "react";

import { Conversation, Message } from "@/types/message-client";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

interface ChatRoomProps {
  selectedConversation?: Conversation;
  messages: Message[];
  isMessagesLoading?: boolean;
  isSendLoading?: boolean;
  viewport: RefObject<HTMLDivElement | null>;
  draft: string;
  onSetDraft: (value: string) => void;
  onSendMessage: (event: SubmitEvent<HTMLFormElement>) => void;
}

export function ChatRoom(props: Readonly<ChatRoomProps>) {
  const {
    selectedConversation: selected,
    messages,
    viewport,
    isMessagesLoading,
    isSendLoading,
    draft,
    onSetDraft: setDraft,
    onSendMessage: handleSend,
  } = props;

  return (
    <Flex direction="column" flex={1} miw={0}>
      {!selected ? (
        <Center flex={1}>
          <EmptyState
            icon={<ChatCenteredTextIcon size={32} />}
            title="No conversation"
            description="Please select conversation on the left side"
            size="md"
            align="left"
            withIndicatorBackground
          />
        </Center>
      ) : (
        <>
          <Text fw={600} p="md" truncate>
            {selected.profile?.displayName || selected.userId}
          </Text>

          <ScrollArea viewportRef={viewport} style={{ flex: 1, minHeight: 0 }}>
            <Stack p="md" gap="sm">
              {isMessagesLoading && <Loader size="sm" mx="auto" />}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </Stack>
          </ScrollArea>

          <MessageComposer
            draft={draft}
            isSendLoading={isSendLoading}
            onSetDraft={setDraft}
            onSendMessage={handleSend}
          />
        </>
      )}
    </Flex>
  );
}
