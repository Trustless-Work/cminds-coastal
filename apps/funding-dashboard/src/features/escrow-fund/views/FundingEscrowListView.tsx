"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { EscrowRecord } from "@repo/features/escrow/services/escrows.service";
import { Skeleton } from "@repo/ui/components/skeleton";

import { EscrowImageCard } from "../components/EscrowImageCard";
import {
  FundingFilterCard,
  type FundingFilterValues,
} from "../components/FundingFilterCard";
import { FundingHero } from "../components/FundingHero";
import { useFundingEscrows } from "../hooks/useFundingEscrows";

const EMPTY_FILTERS: FundingFilterValues = {
  status: "",
  community: "",
  query: "",
};

function filterEscrows(
  escrows: EscrowRecord[],
  filters: FundingFilterValues,
): EscrowRecord[] {
  const query = filters.query.trim().toLowerCase();

  return escrows.filter((escrow) => {
    if (filters.status && escrow.status !== filters.status) {
      return false;
    }
    if (filters.community && escrow.community_name !== filters.community) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = [
      escrow.title,
      escrow.community_name,
      escrow.geographic_area ?? "",
      escrow.description,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export const FundingEscrowListView = () => {
  const { data = [], isLoading, isError, error, refetch } = useFundingEscrows();
  const [draftFilters, setDraftFilters] =
    useState<FundingFilterValues>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FundingFilterValues>(EMPTY_FILTERS);

  const statusOptions = useMemo(
    () =>
      Array.from(new Set(data.map((escrow) => escrow.status))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [data],
  );

  const communityOptions = useMemo(
    () =>
      Array.from(new Set(data.map((escrow) => escrow.community_name))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [data],
  );

  const filtered = useMemo(
    () => filterEscrows(data, appliedFilters),
    [data, appliedFilters],
  );

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 pb-24 pt-6 sm:px-10">
      <FundingHero headline="Support Coastal Work">
        <FundingFilterCard
          values={draftFilters}
          statusOptions={statusOptions}
          communityOptions={communityOptions}
          onChange={setDraftFilters}
          onSearch={() => setAppliedFilters(draftFilters)}
        />
      </FundingHero>

      <section className="mt-12 sm:mt-16">
        <header className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Open Opportunities
            </h2>
            <h3 className="text-sm text-muted-foreground">
              Support coastal conservation projects across the United States.
            </h3>
          </div>

          <button
            type="button"
            className="shrink-0 text-sm text-muted-foreground transition-opacity hover:opacity-70"
            onClick={() => {
              setDraftFilters(EMPTY_FILTERS);
              setAppliedFilters(EMPTY_FILTERS);
            }}
          >
            See all
          </button>
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
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <div className="mt-3 flex flex-col gap-2 px-1 pb-1 sm:mt-4">
                  <Skeleton className="h-6 w-4/5 rounded-md" />
                  <Skeleton className="h-4 w-3/5 rounded-md" />
                  <Skeleton className="h-4 w-2/5 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background-secondary px-6 py-16 text-center">
            <p className="text-lg font-semibold text-foreground">
              No escrows to fund
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.length === 0
                ? "Initialized coastal conservation escrows will appear here."
                : "No escrows match your filters. Try clearing them with See all."}
            </p>
          </div>
        ) : null}

        {!isLoading && filtered.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
            {filtered.map((escrow, index) => {
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
        ) : null}
      </section>
    </div>
  );
};
