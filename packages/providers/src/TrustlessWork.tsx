"use client";

import type { ReactNode } from "react";
import {
  development,
  mainNet,
  TrustlessWorkConfig,
} from "@trustless-work/escrow";
import { clientEnv } from "@repo/config";

export function TrustlessWorkProvider({ children }: { children: ReactNode }) {
  const apiKey = clientEnv.trustlessWorkApiKey ?? "";
  const baseURL = clientEnv.useMainnet ? mainNet : development;

  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  );
}
