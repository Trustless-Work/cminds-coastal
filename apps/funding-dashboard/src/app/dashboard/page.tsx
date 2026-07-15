"use client";

import { Suspense } from "react";
import { AuthGate } from "@repo/features/auth/components/AuthGate";
import { Skeleton } from "@repo/ui/components/skeleton";

import { FundingEscrowListView } from "../../features/escrow-fund/views/FundingEscrowListView";

const ListFallback = () => (
  <div className="mx-auto w-full max-w-[1320px] px-6 pb-24 pt-6 sm:px-10">
    <Skeleton className="h-[320px] w-full rounded-[32px]" />
    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="aspect-[16/10] w-full rounded-[24px]" />
      ))}
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <AuthGate
      appRole="FUNDER"
      appTitle="CMinds"
      logoSrc="/logos/dark-en-logo.png"
      logoHref="/dashboard"
    >
      <Suspense fallback={<ListFallback />}>
        <FundingEscrowListView />
      </Suspense>
    </AuthGate>
  );
}
