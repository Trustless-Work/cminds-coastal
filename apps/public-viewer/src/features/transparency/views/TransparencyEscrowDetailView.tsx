"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  fetchFundingEscrow,
  type EscrowRecord,
} from "@repo/features/escrow/services/escrows.service";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { Navbar } from "@repo/shared/Navbar";
import { SiteFooter } from "@repo/shared/SiteFooter";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { BalanceProgressDonut } from "@repo/tw-blocks/escrows/indicators/balance-progress/donut/BalanceProgress";
import { useEscrowsByContractIdsQuery } from "@repo/tw-blocks/tanstack/useEscrowsByContractIdsQuery";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";

import { ContractIdCopyPanel } from "../components/ContractIdCopyPanel";
import { FALLBACK_COVERS } from "../constants/landing";

type TransparencyEscrowDetailViewProps = {
  contractId: string;
};

export const TransparencyEscrowDetailView = ({
  contractId,
}: TransparencyEscrowDetailViewProps) => {
  const { selectedEscrow, setSelectedEscrow } = useEscrowContext();
  const syncedContractIdRef = useRef<string | null>(null);

  const metadataQuery = useQuery({
    queryKey: ["escrows", "public", "funding", contractId],
    queryFn: () => fetchFundingEscrow(contractId),
  });

  const chainQuery = useEscrowsByContractIdsQuery({
    contractIds: [contractId],
  });

  const chainEscrow = chainQuery.data?.[0];
  const rawBalance =
    selectedEscrow?.contractId === contractId
      ? (selectedEscrow.balance ?? chainEscrow?.balance)
      : chainEscrow?.balance;
  const parsedBalance =
    rawBalance === undefined || rawBalance === null
      ? undefined
      : Number(rawBalance);
  const balance =
    parsedBalance !== undefined && Number.isFinite(parsedBalance)
      ? parsedBalance
      : undefined;

  useEffect(() => {
    if (!chainEscrow?.contractId) return;
    if (syncedContractIdRef.current === chainEscrow.contractId) return;
    syncedContractIdRef.current = chainEscrow.contractId;
    setSelectedEscrow(chainEscrow);
  }, [chainEscrow, setSelectedEscrow]);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar title="CMinds" logoSrc="/logos/dark-en-logo.png" logoHref="/" />

      <div className="mx-auto w-full max-w-[1320px] flex-1 px-6 pb-16 pt-6 sm:px-10">
        {metadataQuery.isLoading ? (
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
        ) : null}

        {metadataQuery.isError ? (
          <Card>
            <CardHeader>
              <CardTitle>Could not load escrow</CardTitle>
              <CardDescription>
                {metadataQuery.error instanceof Error
                  ? metadataQuery.error.message
                  : "Unknown error"}
              </CardDescription>
              <Link href="/" className="text-sm text-primary hover:underline">
                Back to escrows
              </Link>
            </CardHeader>
          </Card>
        ) : null}

        {metadataQuery.data ? (
          <TransparencyEscrowDetailContent
            contractId={contractId}
            metadata={metadataQuery.data}
            balance={balance}
            chainLoading={chainQuery.isLoading}
            hasChainEscrow={Boolean(chainEscrow)}
          />
        ) : null}
      </div>

      <SiteFooter logoSrc="/logos/dark-en-logo.png" />
    </div>
  );
};

type DetailContentProps = {
  contractId: string;
  metadata: EscrowRecord;
  balance: number | undefined;
  chainLoading: boolean;
  hasChainEscrow: boolean;
};

function TransparencyEscrowDetailContent({
  contractId,
  metadata,
  balance,
  chainLoading,
  hasChainEscrow,
}: DetailContentProps) {
  const total = metadata.milestones.reduce(
    (sum, milestone) => sum + Number(milestone.amount),
    0,
  );
  const imageSrc = metadata.image_url ?? FALLBACK_COVERS[0];
  const isLocalImage = imageSrc.startsWith("/");
  const area = metadata.geographic_area?.trim();
  const taskCount = metadata.milestones.length;

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to escrows
      </Link>

      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 space-y-10 lg:col-span-7 xl:col-span-8">
          <div className="overflow-hidden rounded-[24px] border border-border bg-background-secondary sm:rounded-[32px]">
            <div className="relative aspect-[16/10] w-full">
              {isLocalImage ? (
                <Image
                  src={imageSrc}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- remote escrow covers may use any storage host
                <img
                  src={imageSrc}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              )}
            </div>
          </div>

          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-xl font-medium">
                {metadata.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {taskCount} task{taskCount === 1 ? "" : "s"}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {metadata.title}
            </h1>

            <p className="text-base text-muted-foreground">
              {metadata.community_name}
              {area ? (
                <>
                  <span className="mx-2 text-border" aria-hidden>
                    ·
                  </span>
                  <span>{area}</span>
                </>
              ) : null}
            </p>

            {metadata.description ? (
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                {metadata.description}
              </p>
            ) : null}
          </header>

          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
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
                  className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-xl font-mono text-xs font-medium"
                      >
                        {milestone.task.code}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {milestone.task.category}
                      </span>
                    </div>
                    <p className="text-base font-medium leading-snug text-foreground">
                      {milestone.task.name}
                    </p>
                    {milestone.task.expected_deliverable ? (
                      <p className="text-sm text-muted-foreground">
                        {milestone.task.expected_deliverable}
                      </p>
                    ) : null}
                  </div>
                  <UsdcAmount
                    amount={Number(milestone.amount)}
                    size="sm"
                    className="shrink-0 font-semibold text-foreground"
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="space-y-6 rounded-[24px] border border-border bg-background p-6 sm:p-8 lg:sticky lg:top-24">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Escrow overview
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Public view of funded progress. Funding happens in the funding
                dashboard.
              </p>
            </div>

            <dl className="flex flex-row items-stretch gap-4 rounded-2xl border border-border px-4 py-5">
              <div className="min-w-0 flex-1 space-y-1.5">
                <dt className="text-xs text-muted-foreground">Total</dt>
                <dd>
                  <UsdcAmount
                    amount={total}
                    size="lg"
                    className="font-semibold text-foreground"
                  />
                </dd>
              </div>

              <Separator orientation="vertical" />

              <div className="min-w-0 flex-1 space-y-1.5">
                <dt className="text-xs text-muted-foreground">Balance</dt>
                <dd>
                  {balance !== undefined ? (
                    <UsdcAmount
                      amount={balance}
                      size="lg"
                      className="font-semibold text-foreground"
                    />
                  ) : (
                    <span className="text-base text-muted-foreground">
                      {chainLoading ? "…" : "—"}
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="rounded-2xl border border-border px-4 py-5">
              <BalanceProgressDonut
                contractId={contractId}
                target={total}
                currency="USDC"
                balance={balance}
              />
            </div>

            {!hasChainEscrow && !chainLoading ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                On-chain data unavailable. You can still review milestone
                details and copy the contract ID below.
              </p>
            ) : null}

            <div className="border-t border-border pt-6">
              <ContractIdCopyPanel contractId={contractId} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
