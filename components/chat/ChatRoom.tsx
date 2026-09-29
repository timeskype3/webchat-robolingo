import {
  Button,
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
import {
  Fragment,
  useRef,
  type SubmitEvent,
} from "react";
import { format, isSameDay } from "date-fns";
import { th } from "date-fns/locale";

import { Conversation, Message } from "@/types/message-client";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useScrollSentinel } from "@/hooks/useScrollSentinel";

interface ChatRoomProps {
  isLoadingOlder: boolean;
  hasMore: boolean;
  loadOlder: () => Promise<void>;
  loadError: boolean;
  selectedConversation?: Conversation;
  messages: Message[];
  isMessagesLoading?: boolean;
  isSendLoading?: boolean;
  draft: string;
  onSetDraft: (value: string) => void;
  onSendMessage: (event: SubmitEvent<HTMLFormElement>) => void;
}

export function ChatRoom(props: Readonly<ChatRoomProps>) {
  const {
    selectedConversation: selected,
    messages,
    isLoadingOlder,
    hasMore,
    loadOlder,
    loadError,
    isMessagesLoading,
    isSendLoading,
    draft,
    onSetDraft: setDraft,
    onSendMessage: handleSend,
  } = props;

  const sentinel = useRef<HTMLDivElement>(null);
  const { viewport, rememberPosition } = useChatScroll({ messages, isMessagesLoading, isLoadingOlder });

  useScrollSentinel({
    viewport,
    sentinel,
    enabled:
      Boolean(selected) &&
      !isMessagesLoading &&
      !isLoadingOlder &&
      hasMore &&
      !loadError,
    loadMore: loadOlder,
    direction: "top",
    itemCount: messages.length,
  });

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

          <ScrollArea
            viewportRef={viewport}
            onScrollPositionChange={rememberPosition}
            styles={{ viewport: { overflowAnchor: "none" } }}
            style={{ flex: 1, minHeight: 0 }}
          >
            <Stack p="md" gap="sm">
              <div ref={sentinel} style={{ height: 1 }} aria-hidden="true" />
              {isLoadingOlder && <Loader size="sm" mx="auto" />}
              {loadError && (
                <Button
                  variant="subtle"
                  onClick={() => void loadOlder()}
                  loading={isLoadingOlder}
                >
                  Retry loading messages
                </Button>
              )}
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
                    <div data-message-id={message.id}>
                      <MessageBubble message={message} />
                    </div>
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
