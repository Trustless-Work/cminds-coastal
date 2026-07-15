"use client";

import { usePollar } from "@pollar/react";
import { clientEnv } from "@repo/config";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const BROWSER_WALLET_KEY = "cminds_browser_wallet";

type StoredBrowserWallet = {
  address: string;
  name: string;
};

function readStoredBrowserWallet(): StoredBrowserWallet | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(BROWSER_WALLET_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "address" in parsed &&
      "name" in parsed &&
      typeof (parsed as StoredBrowserWallet).address === "string" &&
      typeof (parsed as StoredBrowserWallet).name === "string"
    ) {
      return parsed as StoredBrowserWallet;
    }
  } catch {
    return null;
  }

  return null;
}

function writeStoredBrowserWallet(wallet: StoredBrowserWallet | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!wallet) {
    window.localStorage.removeItem(BROWSER_WALLET_KEY);
    return;
  }

  window.localStorage.setItem(BROWSER_WALLET_KEY, JSON.stringify(wallet));
}

const noopSetWalletInfo = (): void => {};
const noopClearWalletInfo = (): void => {};

const emptyWalletValue: WalletContextType = {
  walletAddress: null,
  walletName: null,
  setWalletInfo: noopSetWalletInfo,
  clearWalletInfo: noopClearWalletInfo,
};

function useBrowserWalletState() {
  const [browserWallet, setBrowserWallet] = useState<StoredBrowserWallet | null>(
    null,
  );

  useEffect(() => {
    setBrowserWallet(readStoredBrowserWallet());
  }, []);

  const setWalletInfo = useCallback((address: string, name: string): void => {
    const next = { address, name };
    setBrowserWallet(next);
    writeStoredBrowserWallet(next);
  }, []);

  const clearWalletInfo = useCallback((): void => {
    setBrowserWallet(null);
    writeStoredBrowserWallet(null);
  }, []);

  return { browserWallet, setWalletInfo, clearWalletInfo };
}

/**
 * Pollar custodial G-address only (community / CMinds dashboards).
 */
function PollarWalletBridge({ children }: { children: ReactNode }) {
  const { wallet } = usePollar();
  const pollarAddress = wallet?.address ?? null;

  const value = useMemo(
    (): WalletContextType => ({
      walletAddress: pollarAddress,
      walletName: pollarAddress ? "Pollar" : null,
      setWalletInfo: noopSetWalletInfo,
      clearWalletInfo: noopClearWalletInfo,
    }),
    [pollarAddress],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

/**
 * External Stellar Wallet Kit only (funding). Never uses Pollar's address.
 */
function BrowserOnlyWalletBridge({ children }: { children: ReactNode }) {
  const { browserWallet, setWalletInfo, clearWalletInfo } =
    useBrowserWalletState();

  const value = useMemo(
    (): WalletContextType => ({
      walletAddress: browserWallet?.address ?? null,
      walletName: browserWallet?.name ?? null,
      setWalletInfo,
      clearWalletInfo,
    }),
    [browserWallet, clearWalletInfo, setWalletInfo],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export type WalletProviderProps = {
  children: ReactNode;
  /**
   * When true, wallet context is Freighter / Wallet Kit only (funding).
   * Pollar login stays separate — its custodial address is never exposed here.
   * Default false keeps Pollar as the sole wallet source (community / CMinds).
   */
  allowBrowserWallet?: boolean;
};

/**
 * Wallet context for Trustless Work escrow forms.
 * - Funding (`allowBrowserWallet`): external Wallet Kit only
 * - Other apps: Pollar custodial address only
 */
export const WalletProvider = ({
  children,
  allowBrowserWallet = false,
}: WalletProviderProps) => {
  if (allowBrowserWallet) {
    return <BrowserOnlyWalletBridge>{children}</BrowserOnlyWalletBridge>;
  }

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
