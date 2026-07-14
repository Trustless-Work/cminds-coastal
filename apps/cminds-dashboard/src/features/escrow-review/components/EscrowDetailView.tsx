"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { EscrowDetailHeader } from "./EscrowDetailHeader";
import { MilestoneList } from "./MilestoneList";
import type { ReviewEscrow } from "../types";

type EscrowDetailViewProps = {
  /**
   * The escrow to render.
   * Pass `null` while loading and set `isLoading` to show skeletons.
   * Pass `undefined` to show the not-found state.
   */
  escrow: ReviewEscrow | null | undefined;
  isLoading?: boolean;
  error?: string | null;
};

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-40 font-mono" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-px w-full mt-1" />
      </div>

      {/* Milestones skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-3 w-full ml-7" />
            <Skeleton className="h-3 w-24 ml-7" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Top-level detail view composing the header + milestone list.
 * Handles loading, error, and not-found states in one place.
 */
export function EscrowDetailView({ escrow, isLoading, error }: EscrowDetailViewProps) {
  if (isLoading || (isLoading && !escrow)) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-foreground">Failed to load escrow</p>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-foreground">Escrow not found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This contract address does not exist or you are not the designated approver.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <EscrowDetailHeader escrow={escrow} />
      <MilestoneList escrow={escrow} />
    </div>
  );
}
