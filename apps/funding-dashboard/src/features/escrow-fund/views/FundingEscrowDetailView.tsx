"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { fetchFundingEscrow } from "@repo/features/escrow/services/escrows.service";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useWalletContext } from "@repo/providers/WalletProvider";
import { FundEscrowDialog } from "@repo/tw-blocks/escrows/single-multi-release/fund-escrow/dialog/FundEscrow";
import { useEscrowsByContractIdsQuery } from "@repo/tw-blocks/tanstack/useEscrowsByContractIdsQuery";
import { WalletButton } from "@repo/tw-blocks/wallet-kit/WalletButtons";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

import { ContractIdCopyPanel } from "../components/ContractIdCopyPanel";

type FundingEscrowDetailViewProps = {
  contractId: string;
};

export const FundingEscrowDetailView = ({
  contractId,
}: FundingEscrowDetailViewProps) => {
  const { walletAddress } = useWalletContext();
  const { setSelectedEscrow } = useEscrowContext();

  const metadataQuery = useQuery({
    queryKey: ["escrows", "funding", contractId],
    queryFn: () => fetchFundingEscrow(contractId),
  });

  const chainQuery = useEscrowsByContractIdsQuery({
    contractIds: [contractId],
  });

  const chainEscrow = chainQuery.data?.[0];

  useEffect(() => {
    if (chainEscrow) {
      setSelectedEscrow(chainEscrow);
    }
  }, [chainEscrow, setSelectedEscrow]);

  if (metadataQuery.isLoading) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  if (metadataQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Could not load escrow</CardTitle>
          <CardDescription>
            {metadataQuery.error instanceof Error
              ? metadataQuery.error.message
              : "Unknown error"}
          </CardDescription>
          <Link
            href="/dashboard"
            className="text-sm text-primary hover:underline"
          >
            Back to escrows
          </Link>
        </CardHeader>
      </Card>
    );
  }

  const metadata = metadataQuery.data;
  if (!metadata) {
    return null;
  }

  const total = metadata.milestones.reduce(
    (sum, milestone) => sum + Number(milestone.amount),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to escrows
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {metadata.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {metadata.community_name}
              {metadata.geographic_area
                ? ` · ${metadata.geographic_area}`
                : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{metadata.status}</Badge>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <UsdcAmount amount={total} size="sm" />
                <span>total tasks</span>
              </span>
              {chainEscrow?.balance !== undefined ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span aria-hidden>·</span>
                  <span>Balance</span>
                  <UsdcAmount amount={chainEscrow.balance} size="sm" />
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {metadata.description ? (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {metadata.description}
          </p>
        ) : null}
      </div>

      <ContractIdCopyPanel contractId={contractId} />

      <section className="space-y-4 rounded-2xl border border-dashed border-foreground/20 bg-muted/30 p-5 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Fund with browser wallet
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Connect Freighter (or another external Stellar wallet), then fund
            this escrow directly with USDC on-chain.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <WalletButton />
          <div className="w-full sm:max-w-xs">
            {walletAddress && chainEscrow ? (
              <FundEscrowDialog />
            ) : (
              <p className="text-sm text-muted-foreground">
                {walletAddress
                  ? chainQuery.isLoading
                    ? "Loading on-chain escrow…"
                    : "On-chain escrow data unavailable. You can still copy the contract ID above."
                  : "Connect a wallet to enable direct funding."}
              </p>
            )}
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tasks</CardTitle>
          <CardDescription>
            Fixed task menu amounts for this coastal conservation escrow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {metadata.milestones.map((milestone) => (
            <div
              key={milestone.escrow_milestone_id}
              className="flex flex-col gap-1 rounded-lg border border-foreground/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {milestone.task.code} · {milestone.task.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {milestone.task.category}
                </p>
              </div>
              <UsdcAmount
                amount={Number(milestone.amount)}
                size="sm"
                className="shrink-0 font-medium"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
