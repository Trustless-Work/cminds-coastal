import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { fundEscrowSchema, type FundEscrowValues } from "./schema";
import { toast } from "sonner";
import { FundEscrowPayload } from "@trustless-work/escrow";
import {
  GetEscrowBalancesResponse,
  GetEscrowsFromIndexerResponse as Escrow,
} from "@trustless-work/escrow/types";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useWalletContext } from "@repo/providers/WalletProvider";

export function useFundEscrow({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { fundEscrow } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();

  const form = useForm<FundEscrowValues>({
    resolver: zodResolver(fundEscrowSchema),
    defaultValues: {
      amount: 0,
    },
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = form.handleSubmit(async (payload) => {
    try {
      setIsSubmitting(true);

      /**
       * Create the final payload for the fund escrow mutation
       *
       * @param payload - The payload from the form
       * @returns The final payload for the fund escrow mutation
       */
      const finalPayload: FundEscrowPayload = {
        amount:
          typeof payload.amount === "string"
            ? Number(payload.amount)
            : payload.amount,
        contractId: selectedEscrow?.contractId || "",
        signer: walletAddress || "",
      };

      /**
       * Call the fund escrow mutation
       *
       * @param payload - The final payload for the fund escrow mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      await fundEscrow.mutateAsync({
        payload: finalPayload,
        type: selectedEscrow?.type || "multi-release",
        address: walletAddress || "",
      });

      const nextBalance = (selectedEscrow?.balance || 0) + finalPayload.amount;

      updateEscrow({
        balance: nextBalance,
      });

      queryClient.setQueriesData<Escrow[]>(
        { queryKey: ["escrows", "contract-ids"] },
        (current) => {
          if (!current) return current;
          return current.map((escrow) =>
            escrow.contractId === finalPayload.contractId
              ? { ...escrow, balance: nextBalance }
              : escrow,
          );
        },
      );

      queryClient.setQueryData<GetEscrowBalancesResponse[]>(
        ["escrows", [finalPayload.contractId]],
        (current) => {
          if (!current?.length) {
            return [
              { address: finalPayload.contractId, balance: nextBalance },
            ];
          }
          return current.map((item) =>
            item.address === finalPayload.contractId
              ? { ...item, balance: nextBalance }
              : item,
          );
        },
      );

      toast.success("Escrow funded successfully");

      onSuccess?.();

      // do something with the response ...
    } catch (error) {
      toast.error(handleError(error as ErrorResponse).message);
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  });

  return { form, handleSubmit, isSubmitting };
}
