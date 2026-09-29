"use client";

import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";
import { softLightTheme } from "@/theme";

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MantineProvider theme={softLightTheme} forceColorScheme="light">
      {children}
    </MantineProvider>
  );
}
