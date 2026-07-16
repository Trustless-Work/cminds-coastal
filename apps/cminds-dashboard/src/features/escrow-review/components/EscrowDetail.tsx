"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useSyncCompletedEscrowStatus } from "@repo/features/escrow/hooks/useSyncCompletedEscrowStatus";
import type {
  EscrowMilestoneRecord,
  EscrowRecord,
} from "@repo/features/escrow/services/escrows.service";
import {
  CANCELLED_ESCROW_IMAGE_CLASS,
  escrowStatusBadgeVariant,
  formatEscrowStatusLabel,
  isEscrowCancelled,
} from "@repo/features/escrow/utils/escrow-status-display";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { BalanceProgressDonut } from "@repo/tw-blocks/escrows/indicators/balance-progress/donut/BalanceProgress";
import { UpdateEscrowDialog } from "@repo/tw-blocks/escrows/multi-release/update-escrow/dialog/UpdateEscrow";
import { useEscrowsByContractIdsQuery } from "@repo/tw-blocks/tanstack/useEscrowsByContractIdsQuery";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import type { MultiReleaseMilestone } from "@trustless-work/escrow/types";

import {
  getMilestoneAmount,
  getMilestoneFlags,
  getMilestoneReviewStatus,
  getMilestoneStatusText,
  parseEvidenceLinks,
} from "../utils";
import { CancelEscrowButton } from "./CancelEscrowButton";
import { ContractIdCopyPanel } from "./ContractIdCopyPanel";
import { MilestoneActions } from "./MilestoneActions";
import { MilestoneFlagBadges } from "./MilestoneFlagBadges";
import { MilestoneStatusBadge } from "./MilestoneStatusBadge";

type EscrowDetailProps = {
  contractId: string;
  metadata: EscrowRecord;
  initialEscrow?: Escrow;
};

export const EscrowDetail = ({
  contractId,
  metadata,
  initialEscrow,
}: EscrowDetailProps) => {
  const { selectedEscrow, setSelectedEscrow } = useEscrowContext();
  const syncedContractIdRef = useRef<string | null>(null);

  const chainQuery = useEscrowsByContractIdsQuery({
    contractIds: [contractId],
  });

  const chainEscrow = initialEscrow ?? chainQuery.data?.[0];
  const balance =
    selectedEscrow?.contractId === contractId
      ? (selectedEscrow.balance ?? chainEscrow?.balance)
      : chainEscrow?.balance;

  useSyncCompletedEscrowStatus({
    escrowId: contractId,
    offchainStatus: metadata.status,
    milestones: (
      selectedEscrow?.contractId === contractId
        ? selectedEscrow?.milestones
        : chainEscrow?.milestones
    ) as MultiReleaseMilestone[] | undefined,
  });

  useEffect(() => {
    if (!chainEscrow?.contractId) return;
    if (syncedContractIdRef.current === chainEscrow.contractId) return;
    syncedContractIdRef.current = chainEscrow.contractId;
    setSelectedEscrow(chainEscrow);
  }, [chainEscrow, setSelectedEscrow]);

  const imageSrc = metadata.image_url ?? "/assets/dashboard.webp";
  const isLocalImage = imageSrc.startsWith("/");
  const cancelled = isEscrowCancelled(metadata.status);
  const area = metadata.geographic_area?.trim();
  const taskCount = metadata.milestones.length;
  const total = metadata.milestones.reduce(
    (sum: number, milestone: EscrowMilestoneRecord) =>
      sum + Number(milestone.amount),
    0,
  );
  const symbol = chainEscrow?.trustline?.symbol ?? "USDC";

  const readyCount =
    chainEscrow?.milestones.filter(
      (milestone) => getMilestoneReviewStatus(milestone) === "ready_for_review",
    ).length ?? 0;
  const disputedCount =
    chainEscrow?.milestones.filter(
      (milestone) => getMilestoneReviewStatus(milestone) === "disputed",
    ).length ?? 0;

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to escrows
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
                    cancelled && CANCELLED_ESCROW_IMAGE_CLASS,
                  )}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- remote escrow covers may use any storage host
                <img
                  src={imageSrc}
                  alt=""
                  className={cn(
                    "absolute inset-0 size-full object-cover",
                    cancelled && CANCELLED_ESCROW_IMAGE_CLASS,
                  )}
                />
              )}
              {cancelled ? (
                <span className="absolute inset-0 bg-background/25" aria-hidden />
              ) : null}
              {cancelled ? (
                <Badge
                  variant="destructive"
                  className="absolute bottom-4 right-4 font-medium"
                >
                  Cancelled
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
              {readyCount > 0 ? (
                <Badge className="rounded-xl font-medium">
                  {readyCount} ready
                </Badge>
              ) : null}
              {disputedCount > 0 ? (
                <Badge variant="destructive" className="rounded-xl font-medium">
                  {disputedCount} disputed
                </Badge>
              ) : null}
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
                  Review evidence and approve or dispute each milestone.
                </p>
              </div>
              <UsdcAmount
                amount={total}
                currency={symbol}
                size="sm"
                className="shrink-0 font-semibold text-foreground"
              />
            </div>

            {chainEscrow ? (
              <ul className="divide-y divide-border overflow-hidden rounded-[24px] border border-border">
                {chainEscrow.milestones.map((milestone, milestoneIndex) => {
                  const status = getMilestoneReviewStatus(milestone);
                  const amount = getMilestoneAmount(milestone);
                  const links = parseEvidenceLinks(milestone.evidence);
                  const metaMilestone = metadata.milestones[milestoneIndex];
                  const showActions =
                    status === "ready_for_review" || status === "disputed";

                  return (
                    <li
                      key={`${chainEscrow.contractId}-${milestoneIndex}`}
                      className="min-w-0 space-y-4 px-4 py-5 sm:px-5"
                    >
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {metaMilestone ? (
                              <Badge
                                variant="outline"
                                className="rounded-xl font-mono text-xs font-medium"
                              >
                                {metaMilestone.task.code}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="rounded-xl text-xs font-medium"
                              >
                                Task {milestoneIndex + 1}
                              </Badge>
                            )}
                            {metaMilestone ? (
                              <span className="min-w-0 break-words text-sm text-muted-foreground">
                                {metaMilestone.task.category}
                              </span>
                            ) : null}
                          </div>
                          <p className="break-words text-base font-medium leading-snug text-foreground">
                            {metaMilestone?.task.name ?? milestone.description}
                          </p>
                          {metaMilestone?.task.expected_deliverable ? (
                            <p className="break-words text-sm text-muted-foreground">
                              {metaMilestone.task.expected_deliverable}
                            </p>
                          ) : null}
                        </div>
                        {amount !== null ? (
                          <UsdcAmount
                            amount={amount}
                            currency={symbol}
                            size="sm"
                            className="shrink-0 self-start font-semibold text-foreground"
                          />
                        ) : null}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="min-w-0 space-y-1.5">
                          <p className="text-xs text-muted-foreground">
                            Evidence
                          </p>
                          {links.length > 0 ? (
                            <ul className="space-y-1">
                              {links.map((link) => (
                                <li key={link}>
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex max-w-full items-center gap-1 text-sm text-primary hover:underline"
                                  >
                                    <span>View Evidence</span>
                                    <ExternalLink className="size-3 shrink-0" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="break-words text-sm text-muted-foreground">
                              {milestone.evidence?.trim() ||
                                "No Evidence Submitted"}
                            </p>
                          )}
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <p className="text-xs text-muted-foreground">
                            Status
                          </p>
                          <MilestoneStatusBadge
                            statusText={getMilestoneStatusText(milestone)}
                          />
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <p className="invisible text-xs" aria-hidden>
                            State
                          </p>
                          <MilestoneFlagBadges
                            flags={getMilestoneFlags(milestone)}
                          />
                        </div>
                      </div>

                      {showActions ? (
                        <div className="border-t border-border pt-4">
                          <MilestoneActions
                            escrow={chainEscrow}
                            milestoneIndex={milestoneIndex}
                            status={status}
                          />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-[24px] border border-border">
                {metadata.milestones.map((milestone: EscrowMilestoneRecord) => (
                  <li
                    key={milestone.escrow_milestone_id}
                    className="flex min-w-0 flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5"
                  >
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
                    </div>
                    <UsdcAmount
                      amount={Number(milestone.amount)}
                      size="sm"
                      className="shrink-0 self-start font-semibold text-foreground sm:self-center"
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="min-w-0 lg:col-span-5 xl:col-span-4">
          <div className="relative z-10 min-w-0 space-y-6 overflow-visible rounded-[24px] border border-border bg-background p-4 sm:p-6 md:p-8 lg:sticky lg:top-24">
            <div className="min-w-0 space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Operator actions
              </h2>
              <p className="break-words text-sm leading-relaxed text-muted-foreground">
                Review funding progress, update escrow parameters, and act on
                tasks that need CMinds attention.
              </p>
            </div>

            <dl className="flex min-w-0 flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border sm:flex-row sm:divide-x sm:divide-y-0">
              <div className="min-w-0 flex-1 space-y-1.5 px-4 py-4">
                <dt className="text-xs text-muted-foreground">Total</dt>
                <dd className="min-w-0">
                  <UsdcAmount
                    amount={total}
                    currency={symbol}
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
                      currency={symbol}
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
              <BalanceProgressDonut
                contractId={contractId}
                target={total}
                currency={symbol}
                balance={balance}
              />
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border p-4">
              <div className="min-w-0 space-y-1">
                <dt className="text-xs text-muted-foreground">Ready</dt>
                <dd className="text-xl font-semibold tabular-nums text-foreground">
                  {readyCount}
                </dd>
              </div>
              <div className="min-w-0 space-y-1">
                <dt className="text-xs text-muted-foreground">Disputed</dt>
                <dd className="text-xl font-semibold tabular-nums text-foreground">
                  {disputedCount}
                </dd>
              </div>
            </dl>

            <div className="min-w-0 space-y-3 border-t border-border pt-6">
              <p className="text-sm font-medium text-foreground">
                Manage Escrow
              </p>
              {chainEscrow && !cancelled ? <UpdateEscrowDialog /> : null}
              <CancelEscrowButton
                escrowId={contractId}
                status={metadata.status}
              />
              {!chainEscrow ? (
                <p className="break-words text-sm leading-relaxed text-muted-foreground">
                  {chainQuery.isLoading
                    ? "Loading on-chain escrow…"
                    : "On-chain data unavailable. You can still review metadata, cancel the escrow, and copy the contract ID."}
                </p>
              ) : null}
            </div>

            <div className="min-w-0 border-t border-border pt-6">
              <ContractIdCopyPanel contractId={contractId} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
