"use client";

import { usePollar } from "@pollar/react";
import { useCallback, useEffect } from "react";

export type WalletAssetBalance = {
  code: string;
  balance: string;
  available: string;
};

type WalletBalanceStatus = "idle" | "loading" | "loaded" | "error";

export type UseWalletBalanceResult = {
  status: WalletBalanceStatus;
  usdc: WalletAssetBalance | null;
  xlm: WalletAssetBalance | null;
  error: string | null;
  refresh: () => Promise<void>;
};

/**
 * Reads the authenticated wallet's on-chain balances from Pollar. Own-profile
 * only — never render this on a public profile.
 */
export function useWalletBalance(): UseWalletBalanceResult {
  const { walletBalance, refreshWalletBalance } = usePollar();

  useEffect(() => {
    if (walletBalance.step === "idle") {
      void refreshWalletBalance();
    }
  }, [walletBalance.step, refreshWalletBalance]);

  const refresh = useCallback(async () => {
    await refreshWalletBalance();
  }, [refreshWalletBalance]);

  if (walletBalance.step === "loaded") {
    const balances = walletBalance.data.balances;
    const usdcRecord = balances.find((entry) => entry.code === "USDC");
    const xlmRecord = balances.find((entry) => entry.type === "native");

    return {
      status: "loaded",
      usdc: usdcRecord
        ? {
            code: usdcRecord.code,
            balance: usdcRecord.balance,
            available: usdcRecord.available,
          }
        : null,
      xlm: xlmRecord
        ? {
            code: "XLM",
            balance: xlmRecord.balance,
            available: xlmRecord.available,
          }
        : null,
      error: null,
      refresh,
    };
  }

  return {
    status: walletBalance.step,
    usdc: null,
    xlm: null,
    error: walletBalance.step === "error" ? walletBalance.message : null,
    refresh,
  };
}
