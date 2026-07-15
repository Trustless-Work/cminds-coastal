"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { formatAddress } from "@repo/helpers";
import { fetchEscrow } from "@repo/features/escrow/services/escrows.service";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useWalletContext } from "@repo/providers/WalletProvider";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { ChangeMilestoneStatusDialog } from "@repo/tw-blocks/escrows/single-multi-release/change-milestone-status/dialog/ChangeMilestoneStatus";
import { ReleaseMilestoneButton } from "@repo/tw-blocks/escrows/multi-release/release-milestone/button/ReleaseMilestone";
import { useEscrowsByContractIdsQuery } from "@repo/tw-blocks/tanstack/useEscrowsByContractIdsQuery";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

type EscrowDetailViewProps = {
  contractId: string;
};

export const EscrowDetailView = ({ contractId }: EscrowDetailViewProps) => {
  const { walletAddress } = useWalletContext();
  const { setSelectedEscrow } = useEscrowContext();

  const metadataQuery = useQuery({
    queryKey: ["escrows", contractId],
    queryFn: () => fetchEscrow(contractId),
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

  if (metadataQuery.isLoading || chainQuery.isLoading) {
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
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            Back to dashboard
          </Link>
        </CardHeader>
      </Card>
    );
  }

  const metadata = metadataQuery.data;
  if (!metadata) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {metadata.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {metadata.community_name}
              {metadata.geographic_area
                ? ` · ${metadata.geographic_area}`
                : ""}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {formatAddress(metadata.escrow_id)}
            </p>
            <Badge variant="outline">{metadata.status}</Badge>
          </div>
          {metadata.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={metadata.image_url}
              alt=""
              className="h-24 w-40 shrink-0 rounded-xl object-cover ring-1 ring-foreground/10"
            />
          ) : null}
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {metadata.description}
        </p>
        {chainEscrow ? (
          <p className="flex flex-wrap items-center gap-1.5 text-sm">
            <span>On-chain balance:</span>
            <UsdcAmount
              amount={chainEscrow.balance ?? 0}
              currency={chainEscrow.trustline?.symbol ?? "USDC"}
              size="sm"
              className="font-semibold"
            />
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            On-chain escrow still indexing — actions available after sync.
          </p>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Tasks</h2>
        <div className="space-y-3">
          {metadata.milestones.map((milestone) => {
            const chainMilestone =
              chainEscrow?.milestones?.[milestone.milestone_index];
            const evidence =
              chainMilestone && "evidence" in chainMilestone
                ? chainMilestone.evidence
                : undefined;
            const statusText =
              chainMilestone && "status" in chainMilestone
                ? chainMilestone.status
                : undefined;
            const flags =
              chainMilestone &&
              "flags" in chainMilestone &&
              chainMilestone.flags
                ? chainMilestone.flags
                : undefined;

            return (
              <Card key={milestone.escrow_milestone_id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        <Badge variant="outline" className="mr-2">
                          {milestone.task.code}
                        </Badge>
                        {milestone.task.name}
                      </CardTitle>
                      <CardDescription>
                        {milestone.custom_description ||
                          milestone.task.expected_deliverable}
                      </CardDescription>
                    </div>
                    <UsdcAmount
                      amount={Number(milestone.amount)}
                      size="sm"
                      className="font-medium"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    Status:{" "}
                    <span className="text-muted-foreground">
                      {statusText || "Pending"}
                    </span>
                  </p>
                  <p>
                    Flags:{" "}
                    <span className="text-muted-foreground">
                      {flags?.approved
                        ? "Approved"
                        : flags?.disputed
                          ? "Disputed"
                          : flags?.released
                            ? "Released"
                            : "—"}
                    </span>
                  </p>
                  {evidence ? (
                    <a
                      href={evidence}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                    >
                      {evidence}
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground">No evidence yet</p>
                  )}
                </CardContent>
                {chainEscrow && walletAddress ? (
                  <CardFooter className="flex flex-col gap-2 border-t pt-(--card-spacing) sm:flex-row">
                    <ChangeMilestoneStatusDialog
                      showSelectMilestone={false}
                      milestoneIndex={milestone.milestone_index}
                    />
                    {flags?.approved && !flags.released ? (
                      <ReleaseMilestoneButton
                        milestoneIndex={milestone.milestone_index}
                      />
                    ) : null}
                  </CardFooter>
                ) : null}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
