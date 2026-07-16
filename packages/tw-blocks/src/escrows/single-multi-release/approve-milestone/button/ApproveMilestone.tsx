import * as React from "react";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import { useWalletContext } from "@repo/providers/WalletProvider";
import {
  ApproveMilestonePayload,
  MultiReleaseMilestone,
} from "@trustless-work/escrow/types";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { IconActionButton } from "@repo/ui/components/icon-action-button";
import { Check } from "lucide-react";

type ApproveMilestoneButtonProps = {
  milestoneIndex: number | string;
};

export const ApproveMilestoneButton = ({
  milestoneIndex,
}: ApproveMilestoneButtonProps) => {
  const { approveMilestone } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleClick() {
    try {
      setIsSubmitting(true);

      const payload: ApproveMilestonePayload = {
        contractId: selectedEscrow?.contractId || "",
        milestoneIndex: String(milestoneIndex),
        approver: walletAddress || "",
      };

      await approveMilestone.mutateAsync({
        payload,
        type: selectedEscrow?.type || "multi-release",
        address: walletAddress || "",
      });

      toastSuccess(
        "Milestone Approved",
        "The community can now release funds for this milestone.",
      );

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
    }
  }

  return (
    <IconActionButton
      label="Approve"
      icon={<Check className="size-4" />}
      loading={isSubmitting}
      onClick={() => {
        void handleClick();
      }}
    />
  );
};
