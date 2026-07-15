"use client";

import Link from "next/link";
import { formatAddress } from "@repo/helpers";
import { NoData } from "@repo/shared/NoData";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import { FileStack } from "lucide-react";

import { fundingLabel } from "../utils";

type EscrowListProps = {
  escrows: Escrow[];
  isLoading?: boolean;
};

function EscrowMeta({ escrow }: { escrow: Escrow }) {
  const symbol = escrow.trustline?.symbol ?? "USDC";
  const milestoneCount = escrow.milestones.length;
  const totalAmount = escrow.milestones.reduce((sum, milestone) => {
    return sum + ("amount" in milestone ? Number(milestone.amount) : 0);
  }, 0);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{fundingLabel(escrow)}</Badge>
        <span className="text-xs text-muted-foreground">
          {milestoneCount} task{milestoneCount === 1 ? "" : "s"}
        </span>
      </div>
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
        <span>Balance</span>
        <UsdcAmount
          amount={escrow.balance ?? 0}
          currency={symbol}
          size="sm"
        />
        <span aria-hidden>·</span>
        <span>Task total</span>
        <UsdcAmount amount={totalAmount} currency={symbol} size="sm" />
      </p>
    </>
  );
}

export const EscrowList = ({ escrows, isLoading }: EscrowListProps) => {
  if (isLoading) {
    return (
      <>
        <div className="space-y-3 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="hidden h-48 rounded-xl md:block" />
      </>
    );
  }

  if (escrows.length === 0) {
    return (
      <NoData
        title="No escrows"
        description="Escrows where you are the approver will appear here once they are initialized on-chain."
        icon={<FileStack />}
      />
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {escrows.map((escrow) => (
          <Card key={escrow.contractId}>
            <CardHeader>
              <CardTitle className="text-base">
                <Link
                  href={`/dashboard/escrows/${escrow.contractId}`}
                  className="hover:underline"
                >
                  {escrow.title}
                </Link>
              </CardTitle>
              <CardDescription>
                {formatAddress(escrow.contractId)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <EscrowMeta escrow={escrow} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl ring-1 ring-foreground/10 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Escrow</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Funding</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Tasks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escrows.map((escrow) => {
              const symbol = escrow.trustline?.symbol ?? "USDC";
              return (
                <TableRow key={escrow.contractId}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/escrows/${escrow.contractId}`}
                      className="hover:underline"
                    >
                      {escrow.title}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatAddress(escrow.contractId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{fundingLabel(escrow)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <UsdcAmount
                      amount={escrow.balance ?? 0}
                      currency={symbol}
                      size="sm"
                      className="justify-end"
                    />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {escrow.milestones.length}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
