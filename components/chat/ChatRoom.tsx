import {
  Avatar,
  Badge,
  Group,
  Center,
  EmptyState,
  Flex,
  Loader,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  Divider,
} from "@mantine/core";
import { ChatCenteredTextIcon, InfoIcon } from "@phosphor-icons/react";
import { Fragment, type RefObject, type SubmitEvent } from "react";
import { format, isSameDay } from "date-fns";
import { th } from "date-fns/locale";

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
    <Flex direction="column" flex={1} miw={0} bg="gray.0">
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
          <Group
            p="md"
            bg="white"
            wrap="nowrap"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Avatar
              src={selected.profile?.pictureUrl}
              radius="xl"
              color="lineGreen"
            />
            <Stack gap={4} miw={0}>
              <Flex align={"center"} gap={5}>
                <Text fw={600} truncate>
                  {selected.profile?.displayName || selected.userId}{" "}
                </Text>
                <Tooltip label={selected.userId}>
                  <InfoIcon style={{ cursor: "pointer" }} />
                </Tooltip>
              </Flex>
              <Badge size="xs" variant="light">
                LINE OA User
              </Badge>
            </Stack>
          </Group>

          <ScrollArea viewportRef={viewport} style={{ flex: 1, minHeight: 0 }}>
            <Stack p="md" gap="sm">
              {isMessagesLoading && <Loader size="sm" mx="auto" />}

              {messages.map((message, index) => {
                const date = message.sentAt.toDate();
                const previousMessage = messages[index - 1];
                const showDate =
                  !previousMessage ||
                  !isSameDay(previousMessage.sentAt.toDate(), date);
                return (
                  <Fragment key={message.id}>
                    {showDate && (
                      <Divider
                        my="md"
                        label={format(date, "d MMMM yyyy", { locale: th })}
                        labelPosition="center"
                      />
                    )}
                    <MessageBubble key={message.id} message={message} />
                  </Fragment>
                );
              })}
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
