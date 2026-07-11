"use client";

import type { ReactNode } from "react";

import { ReactQueryClientProvider } from "./ReactQueryClientProvider";
import { TrustlessWorkProvider } from "./TrustlessWork";
import { WalletProvider } from "./WalletProvider";
import { EscrowProvider } from "./EscrowProvider";
import { EscrowDialogsProvider } from "./EscrowDialogsProvider";
import { EscrowAmountProvider } from "./EscrowAmountProvider";
import { Toaster } from "@repo/ui/components/sonner";

import { PollarProvider } from "./PollarProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReactQueryClientProvider>
        <TrustlessWorkProvider>
          <PollarProvider>
            <WalletProvider>
              <EscrowProvider>
                <EscrowDialogsProvider>
                  <EscrowAmountProvider>
                    {children}
                    <Toaster richColors position="top-center" />
                  </EscrowAmountProvider>
                </EscrowDialogsProvider>
              </EscrowProvider>
            </WalletProvider>
          </PollarProvider>
        </TrustlessWorkProvider>
      </ReactQueryClientProvider>
    </ThemeProvider>
  );
}
