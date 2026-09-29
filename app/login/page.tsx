"use client";

import {
  Alert,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useLogin } from "@/hooks/useLogin";

export default function LoginPage() {
  const { email, setEmail, password, setPassword, loading, error, handleSubmit } =
    useLogin();

  return (
    <Container size={420} py={80}>
      <Paper withBorder shadow="xs" bg="white" p="xl" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <Title order={2}>Sign in to Robolingo chat</Title>

            {error && <Alert color="red">{error}</Alert>}

            <TextInput
              label="Email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />

            <PasswordInput
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />

            <Button type="submit" loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
