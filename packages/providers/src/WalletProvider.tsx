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

/**
 * Browser Wallet Kit (Freighter) state. When enabled, kit connect can override
 * or supplement Pollar for apps that allow direct wallet funding.
 */
function useBrowserWalletState(enabled: boolean) {
  const [browserWallet, setBrowserWallet] = useState<StoredBrowserWallet | null>(
    null,
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setBrowserWallet(readStoredBrowserWallet());
  }, [enabled]);

  const setWalletInfo = useCallback(
    (address: string, name: string): void => {
      if (!enabled) {
        return;
      }
      const next = { address, name };
      setBrowserWallet(next);
      writeStoredBrowserWallet(next);
    },
    [enabled],
  );

  const clearWalletInfo = useCallback((): void => {
    if (!enabled) {
      return;
    }
    setBrowserWallet(null);
    writeStoredBrowserWallet(null);
  }, [enabled]);

  return {
    browserWallet: enabled ? browserWallet : null,
    setWalletInfo,
    clearWalletInfo,
  };
}

function PollarWalletBridge({
  children,
  allowBrowserWallet,
}: {
  children: ReactNode;
  allowBrowserWallet: boolean;
}) {
  const { wallet } = usePollar();
  const pollarAddress = wallet?.address ?? null;
  const { browserWallet, setWalletInfo, clearWalletInfo } =
    useBrowserWalletState(allowBrowserWallet);

  const value = useMemo((): WalletContextType => {
    if (browserWallet) {
      return {
        walletAddress: browserWallet.address,
        walletName: browserWallet.name,
        setWalletInfo,
        clearWalletInfo,
      };
    }

    return {
      walletAddress: pollarAddress,
      walletName: pollarAddress ? "Pollar" : null,
      setWalletInfo,
      clearWalletInfo,
    };
  }, [
    browserWallet,
    clearWalletInfo,
    pollarAddress,
    setWalletInfo,
  ]);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

function BrowserOnlyWalletBridge({ children }: { children: ReactNode }) {
  const { browserWallet, setWalletInfo, clearWalletInfo } =
    useBrowserWalletState(true);

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
   * When true, Freighter / Wallet Kit can set the active address (funding).
   * Default false keeps Pollar as the sole wallet source (community / CMinds).
   */
  allowBrowserWallet?: boolean;
};

/**
 * Bridges Pollar's custodial G-address into the wallet context API used by
 * Trustless Work escrow forms. Optionally also accepts browser Wallet Kit.
 */
export const WalletProvider = ({
  children,
  allowBrowserWallet = false,
}: WalletProviderProps) => {
  if (!clientEnv.pollarApiKey) {
    if (allowBrowserWallet) {
      return <BrowserOnlyWalletBridge>{children}</BrowserOnlyWalletBridge>;
    }

    return (
      <WalletContext.Provider value={emptyWalletValue}>
        {children}
      </WalletContext.Provider>
    );
  }

  return (
    <PollarWalletBridge allowBrowserWallet={allowBrowserWallet}>
      {children}
    </PollarWalletBridge>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
};
