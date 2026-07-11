"use client";

import { usePollar } from "@pollar/react";
import { clientEnv } from "@repo/config";
import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";

type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const noopSetWalletInfo = (): void => {};
const noopClearWalletInfo = (): void => {};

const emptyWalletValue: WalletContextType = {
  walletAddress: null,
  walletName: null,
  setWalletInfo: noopSetWalletInfo,
  clearWalletInfo: noopClearWalletInfo,
};

/**
 * Bridges Pollar's custodial G-address into the existing wallet context API
 * used by Trustless Work escrow forms and mutations.
 */
function PollarWalletBridge({ children }: { children: ReactNode }) {
  const { wallet } = usePollar();
  const walletAddress = wallet?.address ?? null;

  const setWalletInfo = useCallback((): void => {
    // Address is owned by Pollar session; Freighter connect is no longer used.
  }, []);

  const clearWalletInfo = useCallback((): void => {
    // Clearing Freighter local state is a no-op; use Pollar logout instead.
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletName: walletAddress ? "Pollar" : null,
        setWalletInfo,
        clearWalletInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  if (!clientEnv.pollarApiKey) {
    return (
      <WalletContext.Provider value={emptyWalletValue}>
        {children}
      </WalletContext.Provider>
    );
  }

  return <PollarWalletBridge>{children}</PollarWalletBridge>;
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
};
