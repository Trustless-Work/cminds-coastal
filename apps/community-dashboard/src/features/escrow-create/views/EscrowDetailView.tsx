"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { EscrowParties } from "@repo/features/escrow/components/EscrowParties";
import {
  EvidenceLinks,
  hasResolvableEvidence,
} from "@repo/features/escrow/components/EvidenceLinks";
import { fetchEscrow } from "@repo/features/escrow/services/escrows.service";
import {
  CANCELLED_ESCROW_IMAGE_CLASS,
  escrowStatusBadgeVariant,
  formatEscrowStatusLabel,
  isEscrowCancelled,
  isEscrowCompleted,
  isEscrowInactive,
} from "@repo/features/escrow/utils/escrow-status-display";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useWalletContext } from "@repo/providers/WalletProvider";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { MilestoneStatusPieChart } from "@repo/tw-blocks/escrows/indicators/milestone-status-progress/MilestoneStatusPieChart";
import { ChangeMilestoneStatusDialog } from "@repo/tw-blocks/escrows/single-multi-release/change-milestone-status/dialog/ChangeMilestoneStatus";
import { DisputeMilestoneButton } from "@repo/tw-blocks/escrows/multi-release/dispute-milestone/button/DisputeMilestone";
import { ReleaseMilestoneButton } from "@repo/tw-blocks/escrows/multi-release/release-milestone/button/ReleaseMilestone";
import { useEscrowsByContractIdsQuery } from "@repo/tw-blocks/tanstack/useEscrowsByContractIdsQuery";
import type { MilestoneStatusInput } from "@repo/helpers";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";

import { ContractIdCopyPanel } from "../components/ContractIdCopyPanel";

type EscrowDetailViewProps = {
  contractId: string;
};

export const EscrowDetailView = ({ contractId }: EscrowDetailViewProps) => {
  const { walletAddress } = useWalletContext();
  const { selectedEscrow, setSelectedEscrow } = useEscrowContext();
  const syncedContractIdRef = useRef<string | null>(null);

  const metadataQuery = useQuery({
    queryKey: ["escrows", contractId],
    queryFn: () => fetchEscrow(contractId),
  });

  const chainQuery = useEscrowsByContractIdsQuery({
    contractIds: [contractId],
  });

  const chainEscrow = chainQuery.data?.[0];
  const balance =
    selectedEscrow?.contractId === contractId
      ? (selectedEscrow.balance ?? chainEscrow?.balance)
      : chainEscrow?.balance;

  useEffect(() => {
    if (!chainEscrow?.contractId) return;
    if (syncedContractIdRef.current === chainEscrow.contractId) return;
    syncedContractIdRef.current = chainEscrow.contractId;
    setSelectedEscrow(chainEscrow);
  }, [chainEscrow, setSelectedEscrow]);

  if (metadataQuery.isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          <Skeleton className="aspect-[16/10] w-full rounded-[24px]" />
          <Skeleton className="h-10 w-2/3 rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <Skeleton className="h-80 w-full rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (metadataQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Could Not Load Escrow</CardTitle>
          <CardDescription>
            {metadataQuery.error instanceof Error
              ? metadataQuery.error.message
              : "Unknown error"}
          </CardDescription>
          <Link
            href="/dashboard"
            className="text-sm text-primary hover:underline"
          >
            Back To Escrows
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
  const imageSrc = metadata.image_url ?? "/assets/hero.webp";
  const isLocalImage = imageSrc.startsWith("/");
  const cancelled = isEscrowCancelled(metadata.status);
  const completed = isEscrowCompleted(metadata.status);
  const inactive = isEscrowInactive(metadata.status);
  const area = metadata.geographic_area?.trim();
  const taskCount = metadata.milestones.length;
  const canAct = Boolean(chainEscrow && walletAddress);

  const pieMilestones: MilestoneStatusInput[] = metadata.milestones.map(
    (milestone) => {
      const chainMilestone =
        chainEscrow?.milestones?.[milestone.milestone_index];
      return {
        description: `[${milestone.task.code}] ${milestone.task.name}`,
        amount: Number(milestone.amount),
        status:
          chainMilestone && "status" in chainMilestone
            ? chainMilestone.status
            : undefined,
        evidence:
          chainMilestone && "evidence" in chainMilestone
            ? chainMilestone.evidence
            : undefined,
        flags:
          chainMilestone &&
          "flags" in chainMilestone &&
          chainMilestone.flags
            ? chainMilestone.flags
            : undefined,
      };
    },
  );

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back To Escrows
      </Link>

      <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 space-y-8 overflow-hidden sm:space-y-10 lg:col-span-7 xl:col-span-8">
          <div className="overflow-hidden rounded-[24px] border border-border bg-background-secondary sm:rounded-[32px]">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              {isLocalImage ? (
                <Image
                  src={imageSrc}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className={cn(
                    "object-cover",
                    inactive && CANCELLED_ESCROW_IMAGE_CLASS,
                  )}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- remote escrow covers may use any storage host
                <img
                  src={imageSrc}
                  alt=""
                  className={cn(
                    "absolute inset-0 size-full object-cover",
                    inactive && CANCELLED_ESCROW_IMAGE_CLASS,
                  )}
                />
              )}
              {inactive ? (
                <span className="absolute inset-0 bg-background/25" aria-hidden />
              ) : null}
              {cancelled ? (
                <Badge
                  variant="destructive"
                  className="absolute bottom-4 right-4 font-medium"
                >
                  Cancelled
                </Badge>
              ) : completed ? (
                <Badge
                  variant="success"
                  className="absolute bottom-4 right-4 font-medium"
                >
                  Completed
                </Badge>
              ) : null}
            </div>
          </div>

          <header className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={escrowStatusBadgeVariant(metadata.status)}
                className="max-w-full truncate rounded-xl font-medium"
              >
                {formatEscrowStatusLabel(metadata.status)}
              </Badge>
              <span className="shrink-0 text-sm text-muted-foreground">
                {taskCount} task{taskCount === 1 ? "" : "s"}
              </span>
            </div>

            <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {metadata.title}
            </h1>

            <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-base text-muted-foreground">
              <span className="min-w-0 break-words">
                {metadata.community.name}
              </span>
              {area ? (
                <>
                  <span className="shrink-0 text-border" aria-hidden>
                    ·
                  </span>
                  <span className="min-w-0 break-words">{area}</span>
                </>
              ) : null}
            </p>

            {metadata.description ? (
              <p className="max-w-2xl break-words text-base leading-relaxed text-muted-foreground">
                {metadata.description}
              </p>
            ) : null}
          </header>

          <section className="min-w-0 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="min-w-0 space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Tasks
                </h2>
                <p className="text-sm text-muted-foreground">
                  Submit evidence, request help if needed, or release approved tasks.
                </p>
              </div>
              <UsdcAmount
                amount={total}
                size="sm"
                className="shrink-0 font-semibold text-foreground"
              />
            </div>

            <ul className="divide-y divide-border overflow-hidden rounded-[24px] border border-border">
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
                  <li
                    key={milestone.escrow_milestone_id}
                    className="flex min-w-0 flex-col gap-4 px-4 py-5 sm:px-5"
                  >
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="rounded-xl font-mono text-xs font-medium"
                          >
                            {milestone.task.code}
                          </Badge>
                          <span className="min-w-0 break-words text-sm text-muted-foreground">
                            {milestone.task.category}
                          </span>
                        </div>
                        <p className="break-words text-base font-medium leading-snug text-foreground">
                          {milestone.task.name}
                        </p>
                        {milestone.custom_description ||
                        milestone.task.expected_deliverable ? (
                          <p className="break-words text-sm text-muted-foreground">
                            {milestone.custom_description ||
                              milestone.task.expected_deliverable}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">
                            {(statusText || "Pending").toUpperCase()}
                          </Badge>
                          {flags?.released ? (
                            <Badge variant="success">RELEASED</Badge>
                          ) : flags?.resolved ? (
                            <Badge variant="success">RESOLVED</Badge>
                          ) : flags?.disputed ? (
                            <Badge variant="destructive">HELP</Badge>
                          ) : flags?.approved ? (
                            <Badge variant="outline">APPROVED</Badge>
                          ) : null}
                        </div>
                      </div>
                      <UsdcAmount
                        amount={Number(milestone.amount)}
                        size="sm"
                        className="shrink-0 self-start font-semibold text-foreground"
                      />
                    </div>

                    {(() => {
                      const canUpdateStatus =
                        !flags?.approved &&
                        !flags?.released &&
                        !flags?.resolved;
                      const canDispute =
                        !flags?.released &&
                        !flags?.resolved &&
                        !flags?.disputed;
                      const canRelease =
                        Boolean(flags?.approved) &&
                        !flags?.released &&
                        !flags?.resolved;
                      const showRoleActions =
                        canAct && (canUpdateStatus || canDispute || canRelease);
                      const showEvidence = hasResolvableEvidence(evidence);

                      if (!showRoleActions && !showEvidence) return null;

                      return (
                        <div className="border-t border-border/80 pt-4">
                          <TooltipProvider delay={200}>
                            <div className="flex flex-wrap items-center gap-2">
                              {showEvidence ? (
                                <EvidenceLinks evidence={evidence} />
                              ) : null}
                              {canUpdateStatus && canAct ? (
                                <ChangeMilestoneStatusDialog
                                  showSelectMilestone={false}
                                  milestoneIndex={milestone.milestone_index}
                                />
                              ) : null}
                              {canDispute && canAct ? (
                                <DisputeMilestoneButton
                                  milestoneIndex={milestone.milestone_index}
                                />
                              ) : null}
                              {canRelease && canAct ? (
                                <ReleaseMilestoneButton
                                  milestoneIndex={milestone.milestone_index}
                                />
                              ) : null}
                            </div>
                          </TooltipProvider>
                        </div>
                      );
                    })()}
                  </li>
                );
              })}
            </ul>
            {!chainEscrow && !chainQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">
                On-chain escrow still indexing — actions available after sync.
              </p>
            ) : null}
            {chainEscrow && !walletAddress ? (
              <p className="text-sm text-muted-foreground">
                Connect your wallet to submit evidence, dispute, or release
                milestones.
              </p>
            ) : null}
          </section>
        </div>

        <aside className="min-w-0 lg:col-span-5 xl:col-span-4">
          <div className="min-w-0 space-y-6 overflow-hidden rounded-[24px] border border-border bg-background p-4 sm:p-6 md:p-8 lg:sticky lg:top-24">
            <div className="min-w-0 space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Escrow Overview
              </h2>
              <p className="break-words text-sm leading-relaxed text-muted-foreground">
                Track funded progress and share the contract ID with funders.
              </p>
            </div>

            <dl className="flex min-w-0 flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border sm:flex-row sm:divide-x sm:divide-y-0">
              <div className="min-w-0 flex-1 space-y-1.5 px-4 py-4">
                <dt className="text-xs text-muted-foreground">Total</dt>
                <dd className="min-w-0">
                  <UsdcAmount
                    amount={total}
                    size="md"
                    className="font-semibold text-foreground sm:text-2xl"
                  />
                </dd>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5 px-4 py-4">
                <dt className="text-xs text-muted-foreground">Balance</dt>
                <dd className="min-w-0">
                  {balance !== undefined ? (
                    <UsdcAmount
                      amount={balance}
                      size="md"
                      className="font-semibold text-foreground sm:text-2xl"
                    />
                  ) : (
                    <span className="text-base text-muted-foreground">
                      {chainQuery.isLoading ? "…" : "—"}
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-border px-4 py-5">
              <MilestoneStatusPieChart milestones={pieMilestones} />
            </div>

            <EscrowParties escrow={metadata} />

            <div className="min-w-0 border-t border-border pt-6">
              <ContractIdCopyPanel contractId={contractId} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
