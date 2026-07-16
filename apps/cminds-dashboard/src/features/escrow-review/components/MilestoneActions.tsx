"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ApproveMilestoneButton } from "@repo/tw-blocks/escrows/single-multi-release/approve-milestone/button/ApproveMilestone";
import { DisputeMilestoneButton } from "@repo/tw-blocks/escrows/multi-release/dispute-milestone/button/DisputeMilestone";
import { ResolveDisputeDialog } from "@repo/tw-blocks/escrows/multi-release/resolve-dispute/dialog/ResolveDispute";
import { maybeMarkEscrowCompleted } from "@repo/features/escrow/services/maybe-mark-completed";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import type { MultiReleaseMilestone } from "@trustless-work/escrow";

import { useSyncSelectedEscrow } from "../hooks/useSyncSelectedEscrow";
import type { MilestoneReviewStatus } from "../types";

type MilestoneActionsProps = {
  escrow: Escrow;
  milestoneIndex: number;
  status: MilestoneReviewStatus;
};

export const MilestoneActions = ({
  escrow,
  milestoneIndex,
  status,
}: MilestoneActionsProps) => {
  const queryClient = useQueryClient();
  useSyncSelectedEscrow(escrow);

  async function handleSettled(
    milestones: MultiReleaseMilestone[],
  ): Promise<void> {
    const contractId = escrow.contractId;
    if (!contractId) return;
    const updated = await maybeMarkEscrowCompleted(contractId, milestones);
    if (updated) {
      void queryClient.invalidateQueries({ queryKey: ["escrows"] });
    }
  }

  if (status === "ready_for_review") {
    return (
      <div className="grid w-full gap-2 sm:grid-cols-2">
        <ApproveMilestoneButton milestoneIndex={milestoneIndex} />
        <DisputeMilestoneButton milestoneIndex={milestoneIndex} />
      </div>
    );
  }

  if (status === "disputed") {
    return (
      <ResolveDisputeDialog
        showSelectMilestone={false}
        milestoneIndex={milestoneIndex}
        onSuccess={(milestones) => {
          void handleSettled(milestones);
        }}
      />
    );
  }

  return null;
};
