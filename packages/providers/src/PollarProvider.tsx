"use client";

import { PollarProvider as PollarRootProvider } from "@pollar/react";
import { clientEnv } from "@repo/config";
import type { ReactNode } from "react";

const apiKey = clientEnv.pollarApiKey;

export function PollarProvider({ children }: { children: ReactNode }) {
  if (!apiKey) {
    return children;
  }

  return (
    <PollarRootProvider client={{ apiKey, stellarNetwork: "testnet" }}>
      {children}
    </PollarRootProvider>
  );
}
