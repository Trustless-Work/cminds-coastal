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

export type AppProvidersProps = {
  children: ReactNode;
  /**
   * Funding dashboard: wallet context is Wallet Kit only (Freighter, etc.).
   * Does not use Pollar's custodial address for signing or display.
   */
  allowBrowserWallet?: boolean;
};

export function AppProviders({
  children,
  allowBrowserWallet = false,
}: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      <ReactQueryClientProvider>
        <TrustlessWorkProvider>
          <PollarProvider>
            <WalletProvider allowBrowserWallet={allowBrowserWallet}>
              <EscrowProvider>
                <EscrowDialogsProvider>
                  <EscrowAmountProvider>
                    {children}
                    <Toaster />
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
