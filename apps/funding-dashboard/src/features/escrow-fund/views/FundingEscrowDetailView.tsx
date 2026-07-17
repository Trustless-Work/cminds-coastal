"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { EscrowParties } from "@repo/features/escrow/components/EscrowParties";
import { fetchFundingEscrow } from "@repo/features/escrow/services/escrows.service";
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
import { BalanceProgressDonut } from "@repo/tw-blocks/escrows/indicators/balance-progress/donut/BalanceProgress";
import { FundEscrowDialog } from "@repo/tw-blocks/escrows/single-multi-release/fund-escrow/dialog/FundEscrow";
import { useEscrowsByContractIdsQuery } from "@repo/tw-blocks/tanstack/useEscrowsByContractIdsQuery";
import { WalletButton } from "@repo/tw-blocks/wallet-kit/WalletButtons";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

import { ContractIdCopyPanel } from "../components/ContractIdCopyPanel";

type FundingEscrowDetailViewProps = {
  contractId: string;
};

export const FundingEscrowDetailView = ({
  contractId,
}: FundingEscrowDetailViewProps) => {
  const { walletAddress } = useWalletContext();
  const { selectedEscrow, setSelectedEscrow } = useEscrowContext();
  const syncedContractIdRef = useRef<string | null>(null);

  const metadataQuery = useQuery({
    queryKey: ["escrows", "funding", contractId],
    queryFn: () => fetchFundingEscrow(contractId),
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
    // Sync once per contract so a post-fund indexer refetch does not
    // overwrite the optimistic balance from updateEscrow.
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
  const imageSrc = metadata.image_url ?? "/assets/funding.webp";
  const isLocalImage = imageSrc.startsWith("/");
  const cancelled = isEscrowCancelled(metadata.status);
  const completed = isEscrowCompleted(metadata.status);
  const inactive = isEscrowInactive(metadata.status);
  const area = metadata.geographic_area?.trim();
  const taskCount = metadata.milestones.length;

  const fundStatusMessage = walletAddress
    ? chainQuery.isLoading
      ? "Loading on-chain escrow…"
      : chainEscrow
        ? null
        : "On-chain data unavailable. You can still copy the contract ID below."
    : "Connect an external wallet to fund on-chain.";

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
        {/* Main — image, story, tasks */}
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
                  Fixed amounts for this coastal conservation escrow.
                </p>
              </div>
              <UsdcAmount
                amount={total}
                size="sm"
                className="shrink-0 font-semibold text-foreground"
              />
            </div>

            <ul className="divide-y divide-border overflow-hidden rounded-[24px] border border-border">
              {metadata.milestones.map((milestone) => (
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
          </section>
        </div>

        {/* Sidebar — fund actions */}
        <aside className="min-w-0 lg:col-span-5 xl:col-span-4">
          <div className="min-w-0 space-y-6 overflow-hidden rounded-[24px] border border-border bg-background p-4 sm:p-6 md:p-8 lg:sticky lg:top-24">
            <div className="min-w-0 space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Fund this escrow
              </h2>
              <p className="break-words text-sm leading-relaxed text-muted-foreground">
                Contribute USDC with an external wallet, or copy the contract ID
                to send from any Stellar wallet.
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
                    <span className="text-base text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-border px-4 py-5">
              <BalanceProgressDonut
                contractId={contractId}
                target={total}
                currency="USDC"
                balance={balance}
              />
            </div>

            <div className="min-w-0 space-y-3 border-t border-border pt-6">
              <p className="text-sm font-medium text-foreground">
                Browser Wallet
              </p>
              <WalletButton />

              {walletAddress && chainEscrow ? (
                <FundEscrowDialog />
              ) : fundStatusMessage ? (
                <p className="break-words text-sm leading-relaxed text-muted-foreground">
                  {fundStatusMessage}
                </p>
              ) : null}
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
