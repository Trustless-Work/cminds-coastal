"use client";

import type { ReactNode } from "react";
import { ReactQueryClientProvider } from "@repo/providers/ReactQueryClientProvider";
import { ThemeProvider } from "@repo/providers/ThemeProvider";
import { Toaster } from "@repo/ui/components/sonner";

import { SupabaseAuthProvider } from "@/features/auth/hooks/useSupabaseAuth";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
    >
      <ReactQueryClientProvider>
        <SupabaseAuthProvider>
          {children}
          <Toaster />
        </SupabaseAuthProvider>
      </ReactQueryClientProvider>
    </ThemeProvider>
  );
}
