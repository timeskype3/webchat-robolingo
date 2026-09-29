import { Button, Group, TextInput } from "@mantine/core";
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
      <Group p="md" wrap="nowrap">
        <TextInput
          aria-label="Message"
          placeholder="Type a message..."
          value={draft}
          onChange={(event) => onSetDraft(event.currentTarget.value)}
          disabled={isSendLoading}
          maxLength={5000}
          style={{ flex: 1 }}
        />
        <Button type="submit" loading={isSendLoading} disabled={!draft.trim()}>
          Send
        </Button>
      </Group>
    </form>
  );
}
