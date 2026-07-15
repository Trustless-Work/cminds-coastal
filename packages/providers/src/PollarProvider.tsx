"use client";

import { PollarProvider as PollarRootProvider } from "@pollar/react";
import { clientEnv, networkConfig } from "@repo/config";
import type { ReactNode } from "react";

import { getSharedPollarClient } from "./get-shared-pollar-client";
import { PollarSignProvider } from "./usePollarSignTransaction";

export function PollarProvider({ children }: { children: ReactNode }) {
  const apiKey = clientEnv.pollarApiKey;

  if (!apiKey) {
    return <PollarSignProvider>{children}</PollarSignProvider>;
  }

  const client = getSharedPollarClient(apiKey, networkConfig.pollarNetwork);

  return (
    <PollarRootProvider client={client}>
      <PollarSignProvider>{children}</PollarSignProvider>
    </PollarRootProvider>
  );
}
