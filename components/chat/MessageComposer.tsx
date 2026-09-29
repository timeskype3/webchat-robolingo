import { ActionIcon, Group, TextInput } from "@mantine/core";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import type { SubmitEvent } from "react";

interface MessageComposerProps {
  draft: string;
  isSendLoading?: boolean;
  onSetDraft: (value: string) => void;
  onSendMessage: (event: SubmitEvent<HTMLFormElement>) => void;
}

export function MessageComposer({
  draft,
  isSendLoading,
  onSetDraft,
  onSendMessage,
}: Readonly<MessageComposerProps>) {
  return (
    <form onSubmit={onSendMessage}>
      <Group p="md" wrap="nowrap" bg="white" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
        <TextInput
          variant="filled"
          radius="xl"
          size="md"
          aria-label="Message"
          placeholder="Type a message..."
          value={draft}
          onChange={(event) => onSetDraft(event.currentTarget.value)}
          disabled={isSendLoading}
          maxLength={5000}
          style={{ flex: 1 }}
        />
        <ActionIcon type="submit" aria-label="Send message" size={42} radius="xl" loading={isSendLoading} disabled={!draft.trim()}>
          <PaperPlaneTiltIcon size={20} />
        </ActionIcon>
      </Group>
    </form>
  );
}
