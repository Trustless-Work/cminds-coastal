"use client";

import { usePollar } from "@pollar/react";
import { networkConfig } from "@repo/config";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { useState } from "react";

type WithdrawArgs = {
  destination: string;
  amount: string;
};

type UseWithdrawResult = {
  submit: (args: WithdrawArgs) => Promise<void>;
  isSubmitting: boolean;
};

/**
 * Withdraws USDC from the authenticated Pollar wallet to an external address
 * via a Stellar payment (Pollar builds → signs → submits).
 */
export function useWithdraw({
  onSuccess,
}: { onSuccess?: () => void } = {}): UseWithdrawResult {
  const { runTx, refreshWalletBalance } = usePollar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit({ destination, amount }: WithdrawArgs): Promise<void> {
    setIsSubmitting(true);
    try {
      const outcome = await runTx("payment", {
        destination: destination.trim(),
        amount,
        asset: {
          type: "credit_alphanum4" as const,
          code: "USDC",
          issuer: networkConfig.usdcIssuer,
        },
      });

      if (outcome.status === "error") {
        throw new Error(
          outcome.message ??
            outcome.details ??
            "The withdrawal transaction failed.",
        );
      }

      await refreshWalletBalance();

      toastSuccess(
        "Withdrawal Submitted",
        outcome.status === "success"
          ? "Your USDC has been sent to the destination wallet."
          : "Your withdrawal is processing on-chain.",
      );

      onSuccess?.();
    } catch (error) {
      toastError(
        "Withdrawal Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isSubmitting };
}
