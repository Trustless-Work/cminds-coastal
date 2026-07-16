import * as React from "react";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import { useWalletContext } from "@repo/providers/WalletProvider";
import {
  MultiReleaseReleaseFundsPayload,
  MultiReleaseMilestone,
} from "@trustless-work/escrow/types";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import {
  ErrorResponse,
  handleError,
} from "../../../../handle-errors/handle";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEscrowDialogs } from "@repo/providers/EscrowDialogsProvider";
import { useEscrowAmountContext } from "@repo/providers/EscrowAmountProvider";
import { IconActionButton } from "@repo/ui/components/icon-action-button";
import { Banknote } from "lucide-react";

type ReleaseMilestoneButtonProps = {
  milestoneIndex: number | string;
  onSuccess?: (milestones: MultiReleaseMilestone[]) => void;
};

export const ReleaseMilestoneButton = ({
  milestoneIndex,
  onSuccess,
}: ReleaseMilestoneButtonProps) => {
  const { releaseFunds } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const dialogStates = useEscrowDialogs();
  const { setAmounts, setLastReleasedMilestoneIndex } =
    useEscrowAmountContext();
  const { walletAddress } = useWalletContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleClick() {
    try {
      setIsSubmitting(true);

      const payload: MultiReleaseReleaseFundsPayload = {
        contractId: selectedEscrow?.contractId || "",
        releaseSigner: walletAddress || "",
        milestoneIndex: String(milestoneIndex),
      };

      await releaseFunds.mutateAsync({
        payload,
        type: "multi-release",
        address: walletAddress || "",
      });

      toastSuccess(
        "Milestone Released",
        "Funds for this milestone were released on-chain.",
      );

      if (selectedEscrow) {
        const milestone = selectedEscrow.milestones?.[Number(milestoneIndex)];
        const releasedAmount = Number(
          (milestone as MultiReleaseMilestone | undefined)?.amount || 0,
        );
        const platformFee = Number(selectedEscrow.platformFee || 0);
        setAmounts(releasedAmount, platformFee);
      }

      const nextMilestones = (selectedEscrow?.milestones ?? []).map(
        (milestone, index) => {
          if (index === Number(milestoneIndex)) {
            return {
              ...milestone,
              flags: {
                ...(milestone as MultiReleaseMilestone).flags,
                released: true,
              },
            };
          }
          return milestone;
        },
      ) as MultiReleaseMilestone[];

      updateEscrow({
        ...selectedEscrow,
        milestones: nextMilestones,
        balance: (selectedEscrow?.balance || 0) - (selectedEscrow?.amount || 0),
      });

      setLastReleasedMilestoneIndex(Number(milestoneIndex));
      dialogStates.successRelease.setIsOpen(true);
      onSuccess?.(nextMilestones);
    } catch (error) {
      toastError(
        "Release Failed",
        handleError(error as ErrorResponse).message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <IconActionButton
      label="Release"
      icon={<Banknote className="size-4" />}
      loading={isSubmitting}
      onClick={() => {
        void handleClick();
      }}
    />
  );
};
