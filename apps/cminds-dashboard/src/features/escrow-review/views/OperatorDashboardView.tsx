"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";

import { useOperatorEscrows } from "../hooks/useOperatorEscrows";
import { EscrowList } from "../components/EscrowList";
import { MilestoneReviewQueue } from "../components/MilestoneReviewQueue";
import { StatsCards } from "../components/StatsCards";

export const OperatorDashboardView = () => {
  const {
    walletAddress,
    escrows,
    reviewQueue,
    stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useOperatorEscrows();

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect your wallet</CardTitle>
          <CardDescription>
            Sign in with Pollar so we can load escrows where you are the
            approver.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <StatsCards stats={stats} isLoading={isLoading} />

      {isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Could not load escrows</CardTitle>
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
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-medium">Review queue</h2>
          <p className="text-sm text-muted-foreground">
            Approve or dispute tasks with evidence ready for review.
          </p>
        </div>
        <MilestoneReviewQueue items={reviewQueue} isLoading={isLoading} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-medium">Your escrows</h2>
          <p className="text-sm text-muted-foreground">
            Multi-release escrows where your wallet is the approver.
          </p>
        </div>
        <EscrowList escrows={escrows} isLoading={isLoading} />
      </section>
    </div>
  );
};
