"use client";

import { useMemo, type CSSProperties } from "react";
import {
  EscrowListFilterBar,
  ESCROW_STATUS_FILTER_OPTIONS,
} from "@repo/features/escrow/components/EscrowListFilterBar";
import { useEscrowListSearchParams } from "@repo/features/escrow/hooks/useFundingEscrowsInfinite";
import { filterEscrowRecords } from "@repo/features/escrow/utils/filter-escrow-records";
import { NoData } from "@repo/shared/NoData";
import { Skeleton } from "@repo/ui/components/skeleton";
import { FileStack, SearchX } from "lucide-react";

import { useOperatorEscrows } from "../hooks/useOperatorEscrows";
import { EscrowImageCard } from "../components/EscrowImageCard";
import { OperatorBanner } from "../components/OperatorBanner";
import { OperatorStatsCards } from "../components/OperatorStatsCards";
import { ReviewQueueCarousel } from "../components/ReviewQueueCarousel";

export const OperatorDashboardView = () => {
  const {
    enrichedEscrows,
    reviewQueue,
    stats,
    isLoading,
    isChainLoading,
    isError,
    error,
    refetch,
  } = useOperatorEscrows();

  const {
    draftFilters,
    setDraftFilters,
    appliedFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  } = useEscrowListSearchParams();

  const filteredEscrows = useMemo(() => {
    const metadata = enrichedEscrows.map((item) => item.metadata);
    const allowedIds = new Set(
      filterEscrowRecords(metadata, appliedFilters).map((e) => e.escrow_id),
    );
    return enrichedEscrows.filter((item) =>
      allowedIds.has(item.metadata.escrow_id),
    );
  }, [enrichedEscrows, appliedFilters]);

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 pb-24 pt-6 sm:px-10">
      <OperatorBanner headline="Operator Review" />

      <div className="mt-10 grid items-start gap-8 sm:mt-12 lg:grid-cols-12 lg:gap-12">
        <header className="space-y-3 lg:col-span-5">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Coastal Escrow Oversight
          </h2>
          <p className="max-w-xl text-base text-muted-foreground">
            Review evidence, approve milestones, resolve disputes, and monitor
            escrows
            where you are the assigned approver.
          </p>
        </header>

        <div className="lg:col-span-7">
          <OperatorStatsCards
            stats={stats}
            isLoading={isLoading || isChainLoading}
          />
        </div>
      </div>

      {isError ? (
        <div className="mt-10 rounded-2xl border border-border bg-background-secondary px-6 py-10 text-center">
          <p className="text-base font-semibold text-foreground">
            Could not load escrows
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            onClick={() => {
              void refetch();
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      <section className="mt-14 scroll-mt-24 sm:mt-16">
        <header className="mb-6 flex flex-col gap-2 sm:mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Review Queue
          </h3>
          <p className="text-sm text-muted-foreground">
            Approve evidence ready for CMinds review.
          </p>
        </header>
        <ReviewQueueCarousel
          items={reviewQueue}
          isLoading={isLoading || isChainLoading}
        />
      </section>

      <section className="mt-16 scroll-mt-24 sm:mt-20">
        <header className="mb-6 space-y-4 sm:mb-8">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Assigned Escrows
            </h3>
            <p className="text-sm text-muted-foreground">
              Escrows where your account is the on-record approver.
            </p>
          </div>
          <EscrowListFilterBar
            values={draftFilters}
            statusOptions={[...ESCROW_STATUS_FILTER_OPTIONS]}
            onChange={setDraftFilters}
            onSearch={applyFilters}
            onClear={clearFilters}
          />
        </header>

        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col overflow-hidden rounded-[24px] border border-border bg-background p-3 sm:p-4"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                <div className="mt-3 flex flex-col gap-2 px-1 pb-1 sm:mt-4">
                  <Skeleton className="h-6 w-4/5 rounded-md" />
                  <Skeleton className="h-4 w-3/5 rounded-md" />
                  <Skeleton className="mt-2 h-px w-full rounded-none" />
                  <div className="mt-1 grid grid-cols-2 gap-3">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && enrichedEscrows.length === 0 ? (
          <NoData
            title="No assigned escrows"
            description="Escrows that list you as approver will appear here after communities initialize them."
            icon={<FileStack />}
          />
        ) : null}

        {!isLoading &&
        enrichedEscrows.length > 0 &&
        filteredEscrows.length === 0 ? (
          <NoData
            title="No matching escrows"
            description={
              hasActiveFilters
                ? "No escrows match your filters. Try adjusting your search."
                : "No escrows to show."
            }
            icon={<SearchX />}
          />
        ) : null}

        {!isLoading && filteredEscrows.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
            {filteredEscrows.map((item, index) => {
              const style: CSSProperties = {
                animationDelay: `${Math.min(index, 8) * 60}ms`,
              };
              return (
                <EscrowImageCard
                  key={item.metadata.escrow_id}
                  item={item}
                  className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
                  style={style}
                />
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
};
