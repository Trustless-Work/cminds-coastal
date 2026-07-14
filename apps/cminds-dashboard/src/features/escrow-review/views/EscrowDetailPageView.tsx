"use client";

import Link from "next/link";
import { useMemo } from "react";
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
  const { walletAddress, escrows, isLoading, isError, error, refetch } =
    useOperatorEscrows();

  const escrow = useMemo(
    () => escrows.find((item) => item.contractId === contractId),
    [contractId, escrows],
  );

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect your wallet</CardTitle>
          <CardDescription>
            Sign in with Pollar to open this escrow.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  if (isError) {
    return (
      <Card>
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

  if (!escrow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Escrow not found</CardTitle>
          <CardDescription>
            No escrow with this contract id was found for your approver role.
          </CardDescription>
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            Back to dashboard
          </Link>
        </CardHeader>
      </Card>
    );
  }

  return <EscrowDetail escrow={escrow} />;
};
