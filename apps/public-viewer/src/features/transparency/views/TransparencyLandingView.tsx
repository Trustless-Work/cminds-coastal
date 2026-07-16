"use client";

import { useCallback, useMemo, type CSSProperties } from "react";
import {
  useEscrowListSearchParams,
  useFundingEscrowFacets,
  useFundingEscrowsInfinite,
  useLoadMoreOnIntersect,
} from "@repo/features/escrow/hooks/useFundingEscrowsInfinite";
import { LocaleSwitcher } from "@repo/i18n/LocaleSwitcher";
import { Navbar } from "@repo/shared/Navbar";
import { NoData } from "@repo/shared/NoData";
import { SiteFooter } from "@repo/shared/SiteFooter";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Loader2, SearchX, Waves } from "lucide-react";

import { EscrowImageCard } from "../components/EscrowImageCard";
import { LandingInfoSections } from "../components/LandingInfoSections";
import { TransparencyFilterCard } from "../components/TransparencyFilterCard";
import { TransparencyHero } from "../components/TransparencyHero";

export const TransparencyLandingView = () => {
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
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar
        title="CMinds"
        logoSrc="/logos/dark-en-logo.png"
        logoHref="/"
        leading={<LocaleSwitcher />}
      />

      <div className="mx-auto w-full max-w-[1320px] flex-1 px-6 pb-16 pt-6 sm:px-10">
        <TransparencyHero headline="Coastal Progress">
          <TransparencyFilterCard
            values={draftFilters}
            statusOptions={statusOptions}
            communityOptions={communityOptions}
            onChange={setDraftFilters}
            onSearch={applyFilters}
          />
        </TransparencyHero>

        <section className="mt-12 sm:mt-16">
          <header className="mb-8 flex flex-col gap-2 sm:mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Coastal Escrows
            </h2>
            <p className="text-sm text-muted-foreground">
              Browse initialized coastal conservation escrows — open to anyone.
            </p>
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
            <NoData
              title="No escrows to show"
              description={
                hasActiveFilters
                  ? "No escrows match your filters. Try adjusting your search."
                  : "Initialized coastal conservation escrows will appear here."
              }
              icon={hasActiveFilters ? <SearchX /> : <Waves />}
            />
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
                      coverIndex={index}
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

        <LandingInfoSections />
      </div>

      <SiteFooter logoSrc="/logos/dark-en-logo.png" />
    </div>
  );
};
