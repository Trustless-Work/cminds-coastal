"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { MilestoneRow } from "./MilestoneRow";
import type { ReviewEscrow } from "../types";

type MilestoneListProps = {
  escrow: ReviewEscrow;
  isLoading?: boolean;
};

function MilestoneRowSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-3 w-full ml-7" />
      <Skeleton className="h-3 w-24 ml-7" />
    </div>
  );
}

/**
 * Renders the full ordered milestone list for an escrow detail page.
 * Milestones are non-sequential per product rules — all are shown at once.
 */
export function MilestoneList({ escrow, isLoading }: MilestoneListProps) {
  return (
    <section aria-label="Milestones" className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">Milestones</h2>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <MilestoneRowSkeleton />
          <MilestoneRowSkeleton />
          <MilestoneRowSkeleton />
        </div>
      ) : escrow.milestones.length === 0 ? (
        <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
          No milestones have been defined for this escrow yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {escrow.milestones.map((milestone) => (
            <MilestoneRow
              key={milestone.index}
              escrow={escrow}
              milestone={milestone}
            />
          ))}
        </div>
      )}
    </section>
  );
}
