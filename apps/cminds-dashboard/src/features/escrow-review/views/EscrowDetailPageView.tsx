"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

import { EscrowDetail } from "../components/EscrowDetail";
import { useOperatorEscrows } from "../hooks/useOperatorEscrows";

type EscrowDetailPageViewProps = {
  contractId: string;
};

export const EscrowDetailPageView = ({
  contractId,
}: EscrowDetailPageViewProps) => {
  const {
    records,
    chainByContractId,
    isLoading,
    isError,
    error,
    refetch,
  } = useOperatorEscrows();

  const metadata = useMemo(
    () => records.find((item) => item.escrow_id === contractId),
    [contractId, records],
  );
  const chainEscrow = chainByContractId.get(contractId);

  if (isLoading && !metadata) {
    return (
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          <Skeleton className="aspect-[16/10] w-full rounded-[24px]" />
          <Skeleton className="h-10 w-2/3 rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <Skeleton className="h-80 w-full rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (isError && !metadata) {
    return (
      <Card className="rounded-[24px]">
        <CardHeader>
          <CardTitle>Could not load escrow</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Unknown error"}
          </CardDescription>
          <button
            type="button"
            className="w-fit text-sm text-primary hover:underline"
            onClick={() => {
              void refetch();
            }}
          >
            Retry
          </button>
        </CardHeader>
      </Card>
    );
  }

  if (!isLoading && !metadata) {
    return (
      <Card className="rounded-[24px]">
        <CardHeader>
          <CardTitle>Escrow not found</CardTitle>
          <CardDescription>
            No escrow with this contract id was found for your approver role.
          </CardDescription>
          <Link
            href="/dashboard"
            className="text-sm text-primary hover:underline"
          >
            Back to dashboard
          </Link>
        </CardHeader>
      </Card>
    );
  }

  if (!metadata) {
    return null;
  }

  return (
    <EscrowDetail
      contractId={contractId}
      metadata={metadata}
      initialEscrow={chainEscrow}
    />
  );
};
