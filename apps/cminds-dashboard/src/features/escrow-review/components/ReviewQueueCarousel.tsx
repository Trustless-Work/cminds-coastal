"use client";

import Link from "next/link";
import { ClipboardList, ExternalLink } from "lucide-react";
import { formatAddress } from "@repo/helpers";
import { NoData } from "@repo/shared/NoData";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

import type { ReviewQueueItem } from "../types";
import { parseEvidenceLinks } from "../utils";
import { MilestoneActions } from "./MilestoneActions";
import { MilestoneStatusBadge } from "./MilestoneStatusBadge";

type ReviewQueueCarouselProps = {
  items: ReviewQueueItem[];
  isLoading?: boolean;
};

export const ReviewQueueCarousel = ({
  items,
  isLoading,
}: ReviewQueueCarouselProps) => {
  if (isLoading) {
    return (
      <div className="-mx-6 flex gap-4 overflow-hidden px-6 sm:-mx-10 sm:px-10">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-72 w-[min(100%,340px)] shrink-0 rounded-[24px]"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <NoData
        title="Review queue empty"
        description="Tasks marked ready for review or in dispute will show up here."
        icon={<ClipboardList />}
      />
    );
  }

  return (
    <div className="-mx-6 sm:-mx-10">
      <ul
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:gap-6 sm:px-10"
        aria-label="Milestone review queue"
      >
        {items.map((item, index) => (
          <li
            key={`${item.escrow.contractId}-${item.milestoneIndex}`}
            className={cn(
              "w-[min(100%,340px)] shrink-0 snap-start",
              "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500",
            )}
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
          >
            <ReviewQueueCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
};

function ReviewQueueCard({ item }: { item: ReviewQueueItem }) {
  const symbol = item.escrow.trustline?.symbol ?? "USDC";
  const links = parseEvidenceLinks(item.evidence);
  const title = item.metadata?.title ?? item.escrow.title;
  const taskMeta = item.metadata?.milestones[item.milestoneIndex];
  const taskCode = taskMeta?.task.code;
  const taskName = taskMeta?.task.name;
  const communityName = item.metadata?.community.name;

  return (
    <article className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-[24px] border border-border bg-background p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link
            href={`/dashboard/escrows/${item.escrow.contractId}`}
            className="line-clamp-2 text-base font-semibold tracking-tight text-foreground hover:underline"
          >
            {title}
          </Link>
          <p className="truncate text-sm text-muted-foreground">
            {communityName ? (
              <span>{communityName}</span>
            ) : (
              <span className="font-mono text-xs">
                {formatAddress(item.escrow.contractId)}
              </span>
            )}
          </p>
        </div>
        <MilestoneStatusBadge status={item.status} />
      </div>

      <div className="mt-4 min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {taskCode ? (
            <Badge
              variant="outline"
              className="rounded-xl font-mono text-xs font-medium"
            >
              {taskCode}
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-xl text-xs font-medium">
              Task {item.milestoneIndex + 1}
            </Badge>
          )}
          {item.amount !== null ? (
            <UsdcAmount
              amount={item.amount}
              currency={symbol}
              size="sm"
              className="font-semibold text-foreground"
            />
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-foreground">
          {taskName && taskName ? taskName : item.milestoneDescription}
        </p>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Evidence</p>
          {links.length > 0 ? (
            <ul className="space-y-1">
              {links.slice(0, 2).map((link) => (
                <li key={link}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1 truncate text-sm text-primary hover:underline"
                  >
                    <span className="truncate">View Evidence</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {item.evidence?.trim() || "No link"}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <MilestoneActions
          escrow={item.escrow}
          milestoneIndex={item.milestoneIndex}
          status={item.status}
        />
      </div>
    </article>
  );
}
