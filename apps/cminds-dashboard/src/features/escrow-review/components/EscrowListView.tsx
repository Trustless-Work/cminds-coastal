"use client";

import { EscrowListCard } from "./EscrowListCard";
import { EscrowListTable } from "./EscrowListTable";
import type { ReviewEscrow } from "../types";

type EscrowListViewProps = {
  escrows: ReviewEscrow[];
  isLoading?: boolean;
};

/**
 * Responsive escrow list: card layout on mobile, table on md+.
 * Both use the same data props — only the presentation differs.
 */
export function EscrowListView({ escrows, isLoading }: EscrowListViewProps) {
  return (
    <section aria-label="All escrows" className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight">All Escrows</h2>

      {/* Mobile: card grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl bg-muted"
                aria-hidden="true"
              />
            ))
          : escrows.length === 0
          ? (
            <p className="col-span-full rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              No escrows found where you are the approver.
            </p>
          )
          : escrows.map((escrow) => (
              <EscrowListCard key={escrow.contractId} escrow={escrow} />
            ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block rounded-xl border overflow-hidden">
        <EscrowListTable escrows={escrows} isLoading={isLoading} />
      </div>
    </section>
  );
}
