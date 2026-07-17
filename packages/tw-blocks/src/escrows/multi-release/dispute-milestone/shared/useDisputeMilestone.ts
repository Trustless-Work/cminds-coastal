import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  disputeMilestoneSchema,
  type DisputeMilestoneValues,
} from "./schema";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import {
  MultiReleaseStartDisputePayload,
  MultiReleaseMilestone,
} from "@trustless-work/escrow";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useWalletContext } from "@repo/providers/WalletProvider";

export function useDisputeMilestone({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const { startDispute } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();

  const form = useForm<DisputeMilestoneValues>({
    resolver: zodResolver(disputeMilestoneSchema),
    defaultValues: {
      milestoneIndex: "0",
    },
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = form.handleSubmit(async (payload) => {
    try {
      setIsSubmitting(true);

      /**
       * Create the payload for the dispute escrow mutation
       *
       * @returns The payload for the dispute escrow mutation
       */
      const finalPayload: MultiReleaseStartDisputePayload = {
        contractId: selectedEscrow?.contractId || "",
        signer: walletAddress || "",
        milestoneIndex: String(payload.milestoneIndex),
      };

      /**
       * Call the dispute escrow mutation
       *
       * @param payload - The payload for the dispute escrow mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      await startDispute.mutateAsync({
        payload: finalPayload,
        type: "multi-release",
        address: walletAddress || "",
      });

      toastSuccess(
        "Help Requested",
        "This milestone needs help and is awaiting resolution.",
      );

      updateEscrow({
        ...selectedEscrow,
        milestones: selectedEscrow?.milestones.map((milestone, index) => {
          if (index === Number(payload.milestoneIndex)) {
            return {
              ...milestone,
              flags: {
                ...(milestone as MultiReleaseMilestone).flags,
                disputed: true,
              },
            };
          }
          return milestone;
        }),
      });

      onSuccess?.();
    } catch (error) {
      toastError(
        "Help Failed",
        handleError(error as ErrorResponse).message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  });

  return {
    form,
    handleSubmit,
    isSubmitting,
  };
}

