"use client";

import Link from "next/link";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { shortenAddress } from "../utils";
import type { ReviewEscrow } from "../types";

type EscrowDetailHeaderProps = {
  escrow: ReviewEscrow;
};

/**
 * Title bar shown at the top of the escrow detail page.
 * Displays title, shortened contract address, funding status, and a back link.
 */
export function EscrowDetailHeader({ escrow }: EscrowDetailHeaderProps) {
  const isFunded = escrow.balance > 0;
  const approvedCount = escrow.milestones.filter((m) => m.flags.approved).length;
  const totalMilestones = escrow.milestones.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Back navigation */}
      <Button asChild variant="ghost" size="sm" className="self-start -ml-2">
        <Link href="/dashboard">
          ← Back to dashboard
        </Link>
      </Button>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight leading-snug text-balance">
            {escrow.title}
          </h1>

          {/* Contract address — monospaced, copyable */}
          <p
            className="font-mono text-xs text-muted-foreground"
            title={escrow.contractId}
          >
            {shortenAddress(escrow.contractId, 8)}
          </p>

          {escrow.description && (
            <p className="mt-1 text-sm text-muted-foreground max-w-prose text-pretty">
              {escrow.description}
            </p>
          )}
        </div>

        {/* Summary badges */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant={isFunded ? "default" : "outline"}>
            {isFunded
              ? `${escrow.balance.toLocaleString()} ${escrow.trustline.name ?? "USDC"}`
              : "Unfunded"}
          </Badge>
          <Badge variant="secondary">
            {approvedCount}/{totalMilestones} approved
          </Badge>
        </div>
      </div>

      <Separator />
    </div>
  );
}
