import { Button, Group, Title } from "@mantine/core";
import { SignOutIcon } from "@phosphor-icons/react";

interface HeaderSectionProps {
  title: string;
  onLogout: () => void;
}

export function HeaderSection(props: Readonly<HeaderSectionProps>) {
  const { title, onLogout: handleLogout } = props;
  return (
    <Group
      justify="space-between"
      p="md"
      bg="white"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
    >
      <Title order={3}>{title}</Title>
      <Button
        color="red"
        variant="light"
        onClick={handleLogout}
        leftSection={<SignOutIcon />}
      >
        Sign out
      </Button>
    </Group>
  );
}
