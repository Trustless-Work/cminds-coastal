"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  getMilestoneStatus,
  MILESTONE_STATUS_LABEL,
  MILESTONE_STATUS_VARIANT,
} from "../utils";
import type { ReviewEscrow, ReviewMilestone } from "../types";

type MilestoneRowProps = {
  escrow: ReviewEscrow;
  milestone: ReviewMilestone;
};

/**
 * A single milestone displayed inside the escrow detail view.
 *
 * Action slots are left as disabled placeholder buttons with comments
 * so the Cursor agent can drop in the real tw-blocks components.
 *
 * Before rendering any action button, the Cursor agent must:
 *   1. Call useEscrowContext().setSelectedEscrow(escrow)
 *   2. Call useEscrowContext().setUserRolesInEscrow(["approver"])
 */
export function MilestoneRow({ escrow, milestone }: MilestoneRowProps) {
  const status = getMilestoneStatus(milestone);
  const canApprove = status === "evidence_ready";
  const canDispute = status === "evidence_ready";
  const canResolve = status === "disputed";

  return (
    <Card size="sm" className="transition-shadow hover:shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Milestone index pill */}
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums"
              aria-label={`Milestone ${milestone.index + 1}`}
            >
              {milestone.index + 1}
            </span>
            <CardTitle className="text-sm font-medium leading-snug truncate">
              {milestone.title}
            </CardTitle>
          </div>
          <Badge
            variant={MILESTONE_STATUS_VARIANT[status]}
            className="shrink-0"
          >
            {MILESTONE_STATUS_LABEL[status]}
          </Badge>
        </div>

        {milestone.description && (
          <CardDescription className="ml-7 text-xs">
            {milestone.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-2 ml-7">
        {/* Amount */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium tabular-nums">
            {milestone.amount.toLocaleString()}{" "}
            <span className="text-muted-foreground">
              {escrow.trustline.name ?? "USDC"}
            </span>
          </span>
        </div>

        {/* Evidence link */}
        {milestone.evidenceLink ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Evidence</span>
            <a
              href={milestone.evidenceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate max-w-[200px] text-primary underline-offset-2 hover:underline"
              aria-label={`View evidence for milestone ${milestone.title}`}
            >
              {milestone.evidenceLink}
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Evidence</span>
            <span className="text-muted-foreground italic">Not submitted</span>
          </div>
        )}
      </CardContent>

      {/* Only render footer when there are available actions */}
      {(canApprove || canDispute || canResolve) && (
        <CardFooter className="ml-7 gap-2 flex-wrap">
          {canApprove && (
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              aria-label={`Approve milestone ${milestone.title}`}
              disabled
            >
              {/*
                ACTION: ApproveMilestoneButton
                Import: @repo/tw-blocks/escrows/single-multi-release/approve-milestone/button/ApproveMilestone
                Props: milestoneIndex={milestone.index}
                Pre-condition: useEscrowContext().setSelectedEscrow(escrow) must be called first.
              */}
              Approve
            </Button>
          )}

          {canDispute && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              aria-label={`Dispute milestone ${milestone.title}`}
              disabled
            >
              {/*
                ACTION: DisputeMilestoneButton
                Import: @repo/tw-blocks/escrows/multi-release/dispute-milestone/button/DisputeMilestone
                Props: milestoneIndex={milestone.index}
                Pre-condition: useEscrowContext().setSelectedEscrow(escrow) must be called first.
              */}
              Dispute
            </Button>
          )}

          {canResolve && (
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              aria-label={`Resolve dispute for milestone ${milestone.title}`}
              disabled
            >
              {/*
                ACTION: ResolveDisputeButton (or ResolveDisputeDialog for distributions UI)
                Import: @repo/tw-blocks/escrows/multi-release/resolve-dispute/button/ResolveDispute
                Props: milestoneIndex={milestone.index}  distributions={[...]}
                Pre-condition: useEscrowContext().setSelectedEscrow(escrow) must be called first.
              */}
              Resolve Dispute
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
