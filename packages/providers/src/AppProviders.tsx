"use client";

import type { ReactNode } from "react";

import { PollarProvider } from "./PollarProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PollarProvider>{children}</PollarProvider>
    </ThemeProvider>
  );
}
