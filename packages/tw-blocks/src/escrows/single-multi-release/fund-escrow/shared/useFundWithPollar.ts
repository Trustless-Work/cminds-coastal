import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  useFundEscrow,
  useSendTransaction,
  type FundEscrowPayload,
} from "@trustless-work/escrow";
import type {
  GetEscrowBalancesResponse,
  GetEscrowsFromIndexerResponse as Escrow,
} from "@trustless-work/escrow/types";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { usePollarSignTransaction } from "@repo/providers/usePollarSignTransaction";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { fundEscrowSchema, type FundEscrowValues } from "./schema";
import { ErrorResponse, handleError } from "../../../../handle-errors/handle";

/**
 * Fund an escrow with USDC from the authenticated Pollar custodial wallet.
 *
 * Flow: TW builds unsigned XDR → Pollar signs → TW sends. Independent from the
 * Wallet Kit path in {@link useFundEscrow}, so it works even when the funding
 * dashboard exposes only an external wallet in the wallet context.
 */
export function useFundWithPollar({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { signTransaction, walletAddress, ready } = usePollarSignTransaction();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { fundEscrow } = useFundEscrow();
  const { sendTransaction } = useSendTransaction();

  const form = useForm<FundEscrowValues>({
    resolver: zodResolver(fundEscrowSchema),
    defaultValues: { amount: 0 },
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!walletAddress) {
      toastError(
        "Wallet Unavailable",
        "Sign in with Pollar before funding this escrow.",
      );
      return;
    }
    if (!selectedEscrow?.contractId) {
      toastError(
        "Escrow Unavailable",
        "On-chain escrow data is still loading. Please try again.",
      );
      return;
    }

    const amount =
      typeof values.amount === "string" ? Number(values.amount) : values.amount;

    try {
      setIsSubmitting(true);

      const payload: FundEscrowPayload = {
        amount,
        contractId: selectedEscrow.contractId,
        signer: walletAddress,
      };

      const { unsignedTransaction } = await fundEscrow(
        payload,
        selectedEscrow.type ?? "multi-release",
      );

      if (!unsignedTransaction) {
        throw new Error("Unsigned transaction is missing from the response.");
      }

      const signedXdr = await signTransaction(unsignedTransaction);
      if (!signedXdr) {
        throw new Error("Signed transaction is missing.");
      }

      const response = await sendTransaction(signedXdr);
      if (response.status !== "SUCCESS") {
        throw new Error("Transaction failed to send.");
      }

      const nextBalance = (selectedEscrow.balance ?? 0) + amount;

      updateEscrow({ balance: nextBalance });

      queryClient.setQueriesData<Escrow[]>(
        { queryKey: ["escrows", "contract-ids"] },
        (current) =>
          current?.map((escrow) =>
            escrow.contractId === payload.contractId
              ? { ...escrow, balance: nextBalance }
              : escrow,
          ),
      );

      queryClient.setQueryData<GetEscrowBalancesResponse[]>(
        ["escrows", [payload.contractId]],
        (current) => {
          if (!current?.length) {
            return [{ address: payload.contractId, balance: nextBalance }];
          }
          return current.map((item) =>
            item.address === payload.contractId
              ? { ...item, balance: nextBalance }
              : item,
          );
        },
      );

      toastSuccess(
        "Escrow Funded",
        "Your USDC deposit from Pollar has been recorded on-chain.",
      );

      onSuccess?.();
      form.reset();
    } catch (error) {
      toastError(
        "Funding Failed",
        handleError(error as ErrorResponse).message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  return { form, handleSubmit, isSubmitting, walletAddress, ready };
}
