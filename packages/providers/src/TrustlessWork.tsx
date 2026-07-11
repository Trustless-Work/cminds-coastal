"use client";

import type { ReactNode } from "react";
import {
  development,
  mainNet,
  TrustlessWorkConfig,
} from "@trustless-work/escrow";
import { clientEnv, networkConfig } from "@repo/config";

export function TrustlessWorkProvider({ children }: { children: ReactNode }) {
  const apiKey = clientEnv.trustlessWorkApiKey ?? "";
  const baseURL = networkConfig.isMainnet ? mainNet : development;

  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}
