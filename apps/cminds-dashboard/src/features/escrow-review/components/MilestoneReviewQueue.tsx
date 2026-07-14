"use client";

import Link from "next/link";
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
import { Skeleton } from "@repo/ui/components/skeleton";
import { getMilestoneStatus, MILESTONE_STATUS_LABEL, MILESTONE_STATUS_VARIANT, shortenAddress } from "../utils";
import type { ReviewEscrow, ReviewMilestone } from "../types";

/** A single milestone that is ready for review, enriched with its parent escrow context */
type QueueItem = {
  escrow: ReviewEscrow;
  milestone: ReviewMilestone;
};

type MilestoneReviewQueueProps = {
  /** All escrows where the operator is the approver */
  escrows: ReviewEscrow[];
  isLoading?: boolean;
};

function QueueItemSkeleton() {
  return (
    <Card size="sm">
      <CardHeader>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32 mt-1" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </CardFooter>
    </Card>
  );
}

type QueueCardProps = {
  item: QueueItem;
};

/**
 * A single card in the review queue.  Action slots are left as children
 * or render-prop placeholders — the Cursor agent drops in tw-blocks buttons here.
 */
function QueueCard({ item }: QueueCardProps) {
  const { escrow, milestone } = item;
  const status = getMilestoneStatus(milestone);

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">
            {milestone.title}
          </CardTitle>
          <Badge variant={MILESTONE_STATUS_VARIANT[status]} className="shrink-0">
            {MILESTONE_STATUS_LABEL[status]}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {escrow.title} ·{" "}
          <span className="font-mono">{shortenAddress(escrow.contractId)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {milestone.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {milestone.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium tabular-nums">
            {milestone.amount.toLocaleString()}{" "}
            <span className="text-muted-foreground">
              {escrow.trustline.name ?? "USDC"}
            </span>
          </span>
        </div>

        {milestone.evidenceLink && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Evidence</span>
            <a
              href={milestone.evidenceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate max-w-[160px] text-primary underline-offset-2 hover:underline"
              aria-label={`View evidence for ${milestone.title}`}
            >
              View link
            </a>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {/*
          ACTION SLOTS
          ============
          Replace these placeholder buttons with the real tw-blocks action buttons.
          Before rendering any button, call:
            useEscrowContext().setSelectedEscrow(escrow)
            useEscrowContext().setUserRolesInEscrow(["approver"])

          - ACTION: ApproveMilestoneButton from @repo/tw-blocks/escrows/single-multi-release/approve-milestone/button/ApproveMilestone
            Props: milestoneIndex={milestone.index}

          - ACTION: DisputeMilestoneButton from @repo/tw-blocks/escrows/multi-release/dispute-milestone/button/DisputeMilestone
            Props: milestoneIndex={milestone.index}
        */}
        <Button
          size="sm"
          variant="default"
          className="flex-1"
          aria-label={`Approve milestone ${milestone.title}`}
          disabled
        >
          {/* ACTION: <ApproveMilestoneButton milestoneIndex={milestone.index} /> */}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          aria-label={`Dispute milestone ${milestone.title}`}
          disabled
        >
          {/* ACTION: <DisputeMilestoneButton milestoneIndex={milestone.index} /> */}
          Dispute
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href={`/dashboard/escrows/${escrow.contractId}`}>
            Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * The review queue section on the main dashboard.
 * Flattens all escrows into a list of milestones with `evidence_ready` status
 * so the operator can act without navigating into each escrow detail.
 */
export function MilestoneReviewQueue({
  escrows,
  isLoading,
}: MilestoneReviewQueueProps) {
  // Flatten to (escrow, milestone) pairs where evidence is ready
  const queue: QueueItem[] = escrows.flatMap((escrow) =>
    escrow.milestones
      .filter((m) => getMilestoneStatus(m) === "evidence_ready")
      .map((milestone) => ({ escrow, milestone }))
  );

  const disputedItems: QueueItem[] = escrows.flatMap((escrow) =>
    escrow.milestones
      .filter((m) => m.flags.disputed && !m.flags.resolved)
      .map((milestone) => ({ escrow, milestone }))
  );

  return (
    <section aria-label="Milestone review queue" className="flex flex-col gap-6">
      {/* Evidence-ready queue */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">
            Pending Review
          </h2>
          {!isLoading && queue.length > 0 && (
            <Badge variant="secondary">{queue.length}</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QueueItemSkeleton />
            <QueueItemSkeleton />
            <QueueItemSkeleton />
          </div>
        ) : queue.length === 0 ? (
          <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
            No milestones are awaiting review right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {queue.map((item) => (
              <QueueCard
                key={`${item.escrow.contractId}-${item.milestone.index}`}
                item={item}
              />
            ))}
          </div>
        )}
      </div>

      {/* Disputed milestones — need resolution */}
      {(isLoading || disputedItems.length > 0) && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">
              Open Disputes
            </h2>
            {!isLoading && disputedItems.length > 0 && (
              <Badge variant="destructive">{disputedItems.length}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <QueueItemSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {disputedItems.map((item) => (
                <DisputedCard
                  key={`${item.escrow.contractId}-${item.milestone.index}-dispute`}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Separate card variant for milestones in active dispute — shows resolve slot */
function DisputedCard({ item }: QueueCardProps) {
  const { escrow, milestone } = item;

  return (
    <Card size="sm" className="border-destructive/30">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">
            {milestone.title}
          </CardTitle>
          <Badge variant="destructive" className="shrink-0">
            Disputed
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {escrow.title} ·{" "}
          <span className="font-mono">{shortenAddress(escrow.contractId)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium tabular-nums">
            {milestone.amount.toLocaleString()}{" "}
            <span className="text-muted-foreground">
              {escrow.trustline.name ?? "USDC"}
            </span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Dispute is handled off-platform (email). Resolve once parties agree.
        </p>
      </CardContent>

      <CardFooter className="gap-2">
        {/*
          ACTION SLOT
          ===========
          - ACTION: ResolveDisputeButton from @repo/tw-blocks/escrows/multi-release/resolve-dispute/button/ResolveDispute
            Props: milestoneIndex={milestone.index}  distributions={[...]}
          See escrow detail page for the full resolution form (ResolveDisputeDialog).
        */}
        <Button asChild size="sm" variant="default" className="flex-1">
          <Link href={`/dashboard/escrows/${escrow.contractId}`}>
            Resolve in Detail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
