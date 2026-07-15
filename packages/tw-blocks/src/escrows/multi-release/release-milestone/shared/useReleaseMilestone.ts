import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  releaseMilestoneSchema,
  type ReleaseMilestoneValues,
} from "./schema";
import { toast } from "sonner";
import {
  MultiReleaseReleaseFundsPayload,
  MultiReleaseMilestone,
} from "@trustless-work/escrow";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useWalletContext } from "@repo/providers/WalletProvider";
import { useEscrowDialogs } from "@repo/providers/EscrowDialogsProvider";
import { useEscrowAmountContext } from "@repo/providers/EscrowAmountProvider";

export function useReleaseMilestone({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const { releaseFunds } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const dialogStates = useEscrowDialogs();
  const { setAmounts, setLastReleasedMilestoneIndex } =
    useEscrowAmountContext();
  const { walletAddress } = useWalletContext();

  const form = useForm<ReleaseMilestoneValues>({
    resolver: zodResolver(releaseMilestoneSchema),
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
       * Create the payload for the release escrow mutation
       *
       * @returns The payload for the release escrow mutation
       */
      const finalPayload: MultiReleaseReleaseFundsPayload = {
        contractId: selectedEscrow?.contractId || "",
        releaseSigner: walletAddress || "",
        milestoneIndex: String(payload.milestoneIndex),
      };

      /**
       * Call the release escrow mutation
       *
       * @param payload - The payload for the release escrow mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      await releaseFunds.mutateAsync({
        payload: finalPayload,
        type: "multi-release",
        address: walletAddress || "",
      });

      toast.success("Task released successfully");

      // Ensure amounts are up to date for the success dialog
      if (selectedEscrow) {
        const milestone = selectedEscrow.milestones?.[Number(payload.milestoneIndex)];
        const releasedAmount = Number(
          (milestone as MultiReleaseMilestone | undefined)?.amount || 0
        );
        const platformFee = Number(selectedEscrow.platformFee || 0);
        setAmounts(releasedAmount, platformFee);
      }

      updateEscrow({
        ...selectedEscrow,
        milestones: selectedEscrow?.milestones.map((milestone, index) => {
          if (index === Number(payload.milestoneIndex)) {
            return {
              ...milestone,
              flags: {
                ...(milestone as MultiReleaseMilestone).flags,
                released: true,
              },
            };
          }
          return milestone;
        }),
        balance: (selectedEscrow?.balance || 0) - (selectedEscrow?.amount || 0),
      });

      // Remember which milestone was released for the success dialog
      setLastReleasedMilestoneIndex(Number(payload.milestoneIndex));

      // Open success dialog
      dialogStates.successRelease.setIsOpen(true);

      onSuccess?.();
    } catch (error) {
      toast.error(handleError(error as ErrorResponse).message);
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

