import * as React from "react";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import { useWalletContext } from "@repo/providers/WalletProvider";
import {
  MultiReleaseStartDisputePayload,
  MultiReleaseMilestone,
} from "@trustless-work/escrow/types";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { IconActionButton } from "@repo/ui/components/icon-action-button";
import { Swords } from "lucide-react";

type DisputeMilestoneButtonProps = {
  milestoneIndex: number | string;
};

export const DisputeMilestoneButton = ({
  milestoneIndex,
}: DisputeMilestoneButtonProps) => {
  const { startDispute } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleClick() {
    try {
      setIsSubmitting(true);

      const payload: MultiReleaseStartDisputePayload = {
        contractId: selectedEscrow?.contractId || "",
        signer: walletAddress || "",
        milestoneIndex: String(milestoneIndex),
      };

      await startDispute.mutateAsync({
        payload,
        type: "multi-release",
        address: walletAddress || "",
      });

      toastSuccess(
        "Milestone Disputed",
        "This milestone is now in dispute and awaiting resolution.",
      );

      updateEscrow({
        ...selectedEscrow,
        milestones: selectedEscrow?.milestones.map((milestone, index) => {
          if (index === Number(milestoneIndex)) {
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
    } catch (error) {
      toastError(
        "Dispute Failed",
        handleError(error as ErrorResponse).message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <IconActionButton
      label="Dispute"
      icon={<Swords className="size-4" />}
      variant="destructive"
      loading={isSubmitting}
      disabled={!selectedEscrow?.balance}
      onClick={() => {
        void handleClick();
      }}
    />
  );
};
