"use client";

import { ApproveMilestoneButton } from "@repo/tw-blocks/escrows/single-multi-release/approve-milestone/button/ApproveMilestone";
import { ResolveDisputeDialog } from "@repo/tw-blocks/escrows/multi-release/resolve-dispute/dialog/ResolveDispute";
import { TooltipProvider } from "@repo/ui/components/tooltip";
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
      <TooltipProvider delay={200}>
        <div className="flex flex-wrap items-center gap-2">
          <ApproveMilestoneButton milestoneIndex={milestoneIndex} />
        </div>
      </TooltipProvider>
    );
  }

  if (status === "disputed") {
    return (
      <TooltipProvider delay={200}>
        <div className="flex flex-wrap items-center gap-2">
          <ResolveDisputeDialog
            showSelectMilestone={false}
            milestoneIndex={milestoneIndex}
          />
        </div>
      </TooltipProvider>
    );
  }

  return null;
};
