"use client";

import { PollarProvider as PollarRootProvider } from "@pollar/react";
import type { ReactNode } from "react";

const apiKey = process.env.NEXT_PUBLIC_POLLAR_API_KEY;

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
