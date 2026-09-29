"use client";

import { createTheme } from "@mantine/core";

export const softLightTheme = createTheme({
  primaryColor: "lineGreen",
  primaryShade: 8,
  fontFamily: "var(--font-geist-sans), Arial, sans-serif",
  defaultRadius: "md",
  colors: {
    lineGreen: [
      "#E8F9EE",
      "#C8F3D5",
      "#A2ECB9",
      "#74E499",
      "#41D977",
      "#06C755",
      "#05A948",
      "#048A3A",
      "#036A2D",
      "#024D20",
    ],
  },
  shadows: {
    xs: "0 2px 8px rgba(44, 46, 51, 0.04)",
  },
});
