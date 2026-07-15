import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { approveMilestoneSchema, type ApproveMilestoneValues } from "./schema";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import {
  ApproveMilestonePayload,
  MultiReleaseMilestone,
} from "@trustless-work/escrow";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useWalletContext } from "@repo/providers/WalletProvider";

export function useApproveMilestone({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const { approveMilestone } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();

  const form = useForm<ApproveMilestoneValues>({
    resolver: zodResolver(approveMilestoneSchema),
    defaultValues: {
      milestoneIndex: "0",
    },
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = form.handleSubmit(async (payload) => {
    try {
      setIsSubmitting(true);

      const finalPayload: ApproveMilestonePayload = {
        contractId: selectedEscrow?.contractId || "",
        milestoneIndex: payload.milestoneIndex,
        approver: walletAddress || "",
      };

      await approveMilestone.mutateAsync({
        payload: finalPayload,
        type: selectedEscrow?.type || "multi-release",
        address: walletAddress || "",
      });

      toastSuccess(
        "Milestone Approved",
        "The community can now release funds for this milestone.",
      );

      onSuccess?.();

      updateEscrow({
        ...selectedEscrow,
        milestones: selectedEscrow?.milestones.map((milestone, index) => {
          if (index === Number(payload.milestoneIndex)) {
            if (selectedEscrow?.type === "single-release") {
              return { ...milestone, approved: true };
            } else {
              return {
                ...milestone,
                flags: {
                  ...(milestone as MultiReleaseMilestone).flags,
                  approved: true,
                },
              };
            }
          }
          return milestone;
        }),
      });
    } catch (error) {
      toastError(
        "Approval Failed",
        handleError(error as ErrorResponse).message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  });

  return { form, handleSubmit, isSubmitting };
}
