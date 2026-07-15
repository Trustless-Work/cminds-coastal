"use client";

import { useCallback, useMemo, type CSSProperties } from "react";
import {
  useEscrowListSearchParams,
  useFundingEscrowFacets,
  useFundingEscrowsInfinite,
  useLoadMoreOnIntersect,
} from "@repo/features/escrow/hooks/useFundingEscrowsInfinite";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Loader2 } from "lucide-react";

import { EscrowImageCard } from "../components/EscrowImageCard";
import { FundingFilterCard } from "../components/FundingFilterCard";
import { FundingHero } from "../components/FundingHero";

export const FundingEscrowListView = () => {
  const {
    draftFilters,
    setDraftFilters,
    appliedFilters,
    applyFilters,
    hasActiveFilters,
  } = useEscrowListSearchParams();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFundingEscrowsInfinite(appliedFilters);

  const { data: facets } = useFundingEscrowFacets();

  const escrows = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const statusOptions = facets?.statuses ?? [];
  const communityOptions = facets?.communities ?? [];

  const onLoadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const sentinelRef = useLoadMoreOnIntersect(
    onLoadMore,
    Boolean(hasNextPage) && !isFetchingNextPage && !isLoading && !isError,
  );

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 pb-24 pt-6 sm:px-10">
      <FundingHero headline="Support Coastal Work">
        <FundingFilterCard
          values={draftFilters}
          statusOptions={statusOptions}
          communityOptions={communityOptions}
          onChange={setDraftFilters}
          onSearch={applyFilters}
        />
      </FundingHero>

      <section className="mt-12 sm:mt-16">
        <header className="mb-8 flex flex-col gap-2 sm:mb-10">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Open Opportunities
          </h2>
          <h3 className="text-sm text-muted-foreground">
            Support coastal conservation projects across the United States.
          </h3>
        </header>

        {isError ? (
          <div className="rounded-2xl border border-border bg-background-secondary px-6 py-10 text-center">
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
                  <Skeleton className="h-4 w-full rounded-md" />
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

        {!isLoading && !isError && escrows.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background-secondary px-6 py-16 text-center">
            <p className="text-lg font-semibold text-foreground">
              No escrows to fund
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasActiveFilters
                ? "No escrows match your filters. Try adjusting your search."
                : "Initialized coastal conservation escrows will appear here."}
            </p>
          </div>
        ) : null}

        {!isLoading && escrows.length > 0 ? (
          <>
            <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
              {escrows.map((escrow, index) => {
                const style: CSSProperties = {
                  animationDelay: `${Math.min(index, 8) * 60}ms`,
                };
                return (
                  <EscrowImageCard
                    key={escrow.escrow_id}
                    escrow={escrow}
                    className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
                    style={style}
                  />
                );
              })}
            </div>
            <div
              ref={sentinelRef}
              className="flex min-h-10 items-center justify-center py-8"
              aria-hidden={!isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2
                  className="size-5 animate-spin text-muted-foreground"
                  aria-label="Loading more escrows"
                />
              ) : null}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
};
