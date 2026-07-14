"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { countPendingReview, shortenAddress } from "../utils";
import type { ReviewEscrow } from "../types";

type EscrowListCardProps = {
  escrow: ReviewEscrow;
};

/**
 * Mobile card representation of a single escrow in the operator's list.
 * Shown on viewports below `md`.
 */
export function EscrowListCard({ escrow }: EscrowListCardProps) {
  const pendingCount = countPendingReview(escrow.milestones);
  const totalMilestones = escrow.milestones.length;
  const approvedCount = escrow.milestones.filter((m) => m.flags.approved).length;
  const disputedCount = escrow.milestones.filter((m) => m.flags.disputed).length;
  const isFunded = escrow.balance > 0;

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">
            {escrow.title}
          </CardTitle>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="shrink-0">
              {pendingCount} to review
            </Badge>
          )}
        </div>
        <CardDescription className="font-mono text-xs">
          {shortenAddress(escrow.contractId)}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {/* Funding status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Balance</span>
          <span className={isFunded ? "font-medium" : "text-muted-foreground"}>
            {isFunded
              ? `${escrow.balance.toLocaleString()} ${escrow.trustline.name ?? "USDC"}`
              : "Unfunded"}
          </span>
        </div>

        {/* Milestone progress */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Milestones</span>
          <span>
            {approvedCount}/{totalMilestones} approved
            {disputedCount > 0 && (
              <span className="ml-1 text-destructive">· {disputedCount} disputed</span>
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href={`/dashboard/escrows/${escrow.contractId}`}>
            Review
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
