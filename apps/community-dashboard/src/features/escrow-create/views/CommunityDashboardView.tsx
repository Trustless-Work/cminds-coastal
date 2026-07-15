"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { NoData } from "@repo/shared/NoData";
import { Skeleton } from "@repo/ui/components/skeleton";
import { FileStack } from "lucide-react";

import { CommunityBanner } from "../components/CommunityBanner";
import { CommunityEscrowImageCard } from "../components/CommunityEscrowImageCard";
import { CommunityStatsCards } from "../components/CommunityStatsCards";
import { useCommunityEscrows } from "../hooks/useCommunityEscrows";

export const CommunityDashboardView = () => {
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCommunityEscrows();

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 pb-24 pt-6 sm:px-10">
      <CommunityBanner headline="Your coastal work" />

      <div className="mt-10 grid items-start gap-8 sm:mt-12 lg:grid-cols-12 lg:gap-12">
        <header className="flex flex-col gap-4 lg:col-span-5">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your coastal escrows
            </h2>
            <p className="max-w-xl text-base text-muted-foreground">
              Escrows you initialized or signed as release signer — create
              tasks, submit evidence, and release approved funds.
            </p>
          </div>
          <Link
            href="/dashboard/escrows/new"
            className="inline-flex h-11 w-fit shrink-0 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create Escrow
          </Link>
        </header>

        <div className="lg:col-span-7">
          <CommunityStatsCards escrows={data} isLoading={isLoading} />
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

      <section className="mt-12 sm:mt-14">
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

        {!isLoading && !isError && data.length === 0 ? (
          <NoData
            title="No escrows yet"
            description="Create an escrow from the fixed task menu to get started."
            icon={<FileStack />}
            link="/dashboard/escrows/new"
            linkText="Create Escrow"
          />
        ) : null}

        {!isLoading && data.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
            {data.map((escrow, index) => {
              const style: CSSProperties = {
                animationDelay: `${Math.min(index, 8) * 60}ms`,
              };
              return (
                <CommunityEscrowImageCard
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
