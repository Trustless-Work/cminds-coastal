"use client";

import { usePollar } from "@pollar/react";
import { clientEnv } from "@repo/config";
import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";

type SignTransactionFn = (unsignedTransaction: string) => Promise<string>;

type PollarSignContextValue = {
  signTransaction: SignTransactionFn;
};

const PollarSignContext = createContext<PollarSignContextValue | null>(null);

async function missingPollarSign(): Promise<string> {
  throw new Error(
    "Pollar no está configurado. Configura NEXT_PUBLIC_POLLAR_API_KEY."
  );
}

function PollarSignBridge({ children }: { children: ReactNode }) {
  const { signTx, verified, wallet } = usePollar();

  const signTransaction = useCallback<SignTransactionFn>(
    async (unsignedTransaction) => {
      if (!verified || !wallet?.address) {
        throw new Error(
          "Inicia sesión para obtener tu wallet antes de firmar."
        );
      }

      const outcome = await signTx(unsignedTransaction);

      if (outcome.status !== "signed") {
        throw new Error(
          outcome.message ?? outcome.details ?? "Pollar sign failed"
        );
      }

      return outcome.signedXdr;
    },
    [signTx, verified, wallet?.address]
  );

  return (
    <PollarSignContext.Provider value={{ signTransaction }}>
      {children}
    </PollarSignContext.Provider>
  );
}

/**
 * Provides Pollar `signTx` to the tree. Must wrap children of `@pollar/react`
 * PollarProvider when an API key is present.
 */
export function PollarSignProvider({ children }: { children: ReactNode }) {
  if (!clientEnv.pollarApiKey) {
    return (
      <PollarSignContext.Provider
        value={{ signTransaction: missingPollarSign }}
      >
        {children}
      </PollarSignContext.Provider>
    );
  }

  return <PollarSignBridge>{children}</PollarSignBridge>;
}

/**
 * Signs an unsigned Stellar XDR via Pollar (`signTx` / POST /tx/sign).
 * Does not submit — callers should send the result with Trustless Work
 * `useSendTransaction`.
 */
export function usePollarSignTransaction(): PollarSignContextValue {
  const context = useContext(PollarSignContext);
  if (!context) {
    throw new Error(
      "usePollarSignTransaction must be used within PollarSignProvider"
    );
  }
  return context;
}
