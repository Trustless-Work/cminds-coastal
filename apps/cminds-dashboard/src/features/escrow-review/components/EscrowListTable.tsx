"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { countPendingReview, shortenAddress } from "../utils";
import type { ReviewEscrow } from "../types";

type EscrowListTableProps = {
  escrows: ReviewEscrow[];
  isLoading?: boolean;
};

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32 font-mono" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-16" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

/**
 * Desktop table view of all escrows where the operator is the approver.
 * Shown on `md+` viewports.
 */
export function EscrowListTable({ escrows, isLoading }: EscrowListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Contract</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Milestones</TableHead>
          <TableHead>To Review</TableHead>
          <TableHead className="sr-only">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <SkeletonRows />
        ) : escrows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-10 text-center text-sm text-muted-foreground"
            >
              No escrows found where you are the approver.
            </TableCell>
          </TableRow>
        ) : (
          escrows.map((escrow) => {
            const pendingCount = countPendingReview(escrow.milestones);
            const approvedCount = escrow.milestones.filter(
              (m) => m.flags.approved
            ).length;
            const isFunded = escrow.balance > 0;

            return (
              <TableRow key={escrow.contractId}>
                <TableCell className="font-medium max-w-[240px] truncate">
                  {escrow.title}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {shortenAddress(escrow.contractId)}
                </TableCell>
                <TableCell>
                  {isFunded ? (
                    <span className="text-sm">
                      {escrow.balance.toLocaleString()}{" "}
                      <span className="text-xs text-muted-foreground">
                        {escrow.trustline.name ?? "USDC"}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unfunded
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {approvedCount}/{escrow.milestones.length}
                  </span>
                </TableCell>
                <TableCell>
                  {pendingCount > 0 ? (
                    <Badge variant="secondary">{pendingCount}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/escrows/${escrow.contractId}`}>
                      Review
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
