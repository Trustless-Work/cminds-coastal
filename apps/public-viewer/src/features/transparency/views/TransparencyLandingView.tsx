"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { EscrowRecord } from "@repo/features/escrow/services/escrows.service";
import { Navbar } from "@repo/shared/Navbar";
import { SiteFooter } from "@repo/shared/SiteFooter";
import { Skeleton } from "@repo/ui/components/skeleton";

import { EscrowImageCard } from "../components/EscrowImageCard";
import { LandingInfoSections } from "../components/LandingInfoSections";
import {
  TransparencyFilterCard,
  type TransparencyFilterValues,
} from "../components/TransparencyFilterCard";
import { TransparencyHero } from "../components/TransparencyHero";
import { usePublicEscrows } from "../hooks/usePublicEscrows";

const EMPTY_FILTERS: TransparencyFilterValues = {
  status: "",
  community: "",
  query: "",
};

function filterEscrows(
  escrows: EscrowRecord[],
  filters: TransparencyFilterValues,
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
      escrow.escrow_id,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export const TransparencyLandingView = () => {
  const { data = [], isLoading, isError, error, refetch } = usePublicEscrows();
  const [draftFilters, setDraftFilters] =
    useState<TransparencyFilterValues>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<TransparencyFilterValues>(EMPTY_FILTERS);

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
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar title="CMinds" logoSrc="/logos/dark-en-logo.png" logoHref="/" />

      <div className="mx-auto w-full max-w-[1320px] flex-1 px-6 pb-16 pt-6 sm:px-10">
        <TransparencyHero headline="Coastal Progress">
          <TransparencyFilterCard
            values={draftFilters}
            statusOptions={statusOptions}
            communityOptions={communityOptions}
            onChange={setDraftFilters}
            onSearch={() => setAppliedFilters(draftFilters)}
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
                No escrows to show
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.length === 0
                  ? "Initialized coastal conservation escrows will appear here."
                  : "No escrows match your filters. Try adjusting your search."}
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
                    coverIndex={index}
                    className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
                    style={style}
                  />
                );
              })}
            </div>
          ) : null}
        </section>

        <LandingInfoSections />
      </div>

      <SiteFooter logoSrc="/logos/dark-en-logo.png" />
    </div>
  );
};
