"use client";

import { ApproveMilestoneButton } from "@repo/tw-blocks/escrows/single-multi-release/approve-milestone/button/ApproveMilestone";
import { DisputeMilestoneButton } from "@repo/tw-blocks/escrows/multi-release/dispute-milestone/button/DisputeMilestone";
import { ResolveDisputeDialog } from "@repo/tw-blocks/escrows/multi-release/resolve-dispute/dialog/ResolveDispute";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

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
  useSyncSelectedEscrow(escrow);

  if (status === "ready_for_review") {
    return (
      <div className="flex w-full flex-col gap-2 sm:flex-row">
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
      />
    );
  }

  return null;
};
