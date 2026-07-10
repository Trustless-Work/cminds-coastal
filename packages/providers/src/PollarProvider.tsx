"use client";

import { PollarProvider as PollarRootProvider } from "@pollar/react";
import { useEffect, useState, type ReactNode } from "react";

const apiKey = process.env.NEXT_PUBLIC_POLLAR_API_KEY;

export function PollarProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !apiKey) {
    return children;
  }

  return (
    <PollarRootProvider client={{ apiKey, stellarNetwork: "testnet" }}>
      {children}
    </PollarRootProvider>
  );
}
