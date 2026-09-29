import type { Message } from "@/types/message-client";
import { DIRECTION } from "@/types/message-shared";
import { Flex, Paper, Text } from "@mantine/core";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
}

const statusLabels = {
  PENDING: "Sending",
  ACCEPTED: "Sent",
  FAILED: "Failed",
  UNKNOWN: "Unknown",
};

export function MessageBubble({ message }: Readonly<MessageBubbleProps>) {
  const outgoing = message.direction === DIRECTION.OUTGOING;

  return (
    <Flex justify={outgoing ? "flex-end" : "flex-start"}>
      <Paper
        p="sm"
        radius="lg"
        shadow="xs"
        withBorder
        maw="80%"
        bg={outgoing ? "lineGreen.0" : "white"}
        c={outgoing ? "lineGreen.9" : "gray.8"}
        style={{ borderColor: outgoing ? "var(--mantine-color-lineGreen-1)" : "var(--mantine-color-gray-2)" }}
      >
        {message.messageType === "sticker" ? (
          <Text fs="italic" c="dimmed">
            Sticker received
          </Text>
        ) : (
          <Text style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {message.text}
          </Text>
        )}
        <Text size="xs" c="dimmed" mt={4}>
          {message.sentAt ? format(message.sentAt.toDate(), "HH:mm") : ""}
          {outgoing && message.status
            ? ` · ${statusLabels[message.status]}`
            : ""}
        </Text>
      </Paper>
    </Flex>
  );
}
