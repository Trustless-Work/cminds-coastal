import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changeMilestoneStatusSchema,
  type ChangeMilestoneStatusValues,
} from "./schema";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { ChangeMilestoneStatusPayload } from "@trustless-work/escrow";
import type { MultiReleaseMilestone } from "@trustless-work/escrow/types";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useWalletContext } from "@repo/providers/WalletProvider";

export function useChangeMilestoneStatus({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const { changeMilestoneStatus } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();

  const form = useForm<ChangeMilestoneStatusValues>({
    resolver: zodResolver(changeMilestoneStatusSchema),
    defaultValues: {
      milestoneIndex: "0",
      status: "",
      evidence: "",
    },
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = form.handleSubmit(async (payload) => {
    try {
      setIsSubmitting(true);

      const milestone =
        selectedEscrow?.milestones?.[Number(payload.milestoneIndex)];
      const flags =
        milestone && "flags" in milestone
          ? (milestone as MultiReleaseMilestone).flags
          : undefined;

      if (flags?.released) {
        toastError(
          "Status Locked",
          "This milestone was already released. Status can no longer be updated.",
        );
        return;
      }

      /**
       * Create the final payload for the change milestone status mutation
       *
       * @param payload - The payload from the form
       * @returns The final payload for the change milestone status mutation
       */
      const finalPayload: ChangeMilestoneStatusPayload = {
        contractId: selectedEscrow?.contractId || "",
        milestoneIndex: payload.milestoneIndex,
        newStatus: payload.status,
        newEvidence: payload.evidence || undefined,
        serviceProvider: walletAddress || "",
      };

      /**
       * Call the change milestone status mutation
       *
       * @param payload - The final payload for the change milestone status mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      await changeMilestoneStatus.mutateAsync({
        payload: finalPayload,
        type: selectedEscrow?.type || "multi-release",
        address: walletAddress || "",
      });

      toastSuccess(
        "Task Status Updated",
        "The milestone status was saved on-chain.",
      );

      onSuccess?.();

      updateEscrow({
        ...selectedEscrow,
        milestones: selectedEscrow?.milestones.map((milestone, index) => {
          if (index === Number(payload.milestoneIndex)) {
            return {
              ...milestone,
              status: payload.status,
              evidence: payload.evidence || undefined,
            };
          }
          return milestone;
        }),
      });
    } catch (error) {
      toastError(
        "Status Update Failed",
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
