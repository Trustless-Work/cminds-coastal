"use client";

import { PollarProvider as PollarRootProvider } from "@pollar/react";
import { clientEnv, networkConfig } from "@repo/config";
import type { ReactNode } from "react";

import { PollarSignProvider } from "./usePollarSignTransaction";

export function PollarProvider({ children }: { children: ReactNode }) {
  const apiKey = clientEnv.pollarApiKey;

  if (!apiKey) {
    return <PollarSignProvider>{children}</PollarSignProvider>;
  }

  return (
    <PollarRootProvider
      client={{ apiKey, stellarNetwork: networkConfig.pollarNetwork }}
    >
      <PollarSignProvider>{children}</PollarSignProvider>
    </PollarRootProvider>
  );
}
