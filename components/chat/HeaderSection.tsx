import { Button, Group, Title } from "@mantine/core";

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
      style={{ borderBottom: "1px solid #ddd" }}
    >
      <Title order={3}>{title}</Title>
      <Button variant="light" onClick={handleLogout}>
        Sign out
      </Button>
    </Group>
  );
}
