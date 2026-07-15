import * as React from "react";
import { Button } from "@repo/ui/components/button";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import { useWalletContext } from "@repo/providers/WalletProvider";
import { WithdrawRemainingFundsPayload } from "@trustless-work/escrow/types";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { Loader2 } from "lucide-react";

type Distribution = { address: string; amount: number };

type WithdrawRemainingFundsButtonProps = {
  distributions: Distribution[];
};

export const WithdrawRemainingFundsButton = ({
  distributions,
}: WithdrawRemainingFundsButtonProps) => {
  const { withdrawRemainingFunds } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleClick() {
    try {
      const hasInvalid = distributions.some(
        (d) => !d.address || Number.isNaN(d.amount) || d.amount < 0
      );
      if (hasInvalid) {
        toastError(
          "Invalid Distributions",
          "Check the distribution amounts and try again.",
        );
        return;
      }

      setIsSubmitting(true);

      const payload: WithdrawRemainingFundsPayload = {
        contractId: selectedEscrow?.contractId || "",
        disputeResolver: walletAddress || "",
        distributions: distributions as [{ address: string; amount: number }],
      };

      await withdrawRemainingFunds.mutateAsync({
        payload,
        address: walletAddress || "",
      });

      toastSuccess(
        "Withdrawal Complete",
        "Remaining funds were withdrawn successfully.",
      );
      const sumDistributed = distributions.reduce(
        (acc, d) => acc + Number(d.amount || 0),
        0
      );
      updateEscrow({
        ...selectedEscrow,
        balance: (selectedEscrow?.balance || 0) - sumDistributed || 0,
      });
    } catch (error) {
      toastError(
        "Withdrawal Failed",
        handleError(error as ErrorResponse).message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      type="button"
      disabled={isSubmitting}
      onClick={handleClick}
      className="cursor-pointer w-full"
    >
      {isSubmitting ? (
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2">Withdrawing...</span>
        </div>
      ) : (
        "Withdraw Remaining"
      )}
    </Button>
  );
};
