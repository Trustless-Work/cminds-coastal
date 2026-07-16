"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { EscrowRecord } from "@repo/features/escrow/services/escrows.service";
import {
  CANCELLED_ESCROW_IMAGE_CLASS,
  escrowStatusBadgeVariant,
  formatEscrowStatusLabel,
  isEscrowCancelled,
} from "@repo/features/escrow/utils/escrow-status-display";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";

type CommunityEscrowImageCardProps = {
  escrow: EscrowRecord;
  className?: string;
  style?: CSSProperties;
};

function formatCreatedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export const CommunityEscrowImageCard = ({
  escrow,
  className,
  style,
}: CommunityEscrowImageCardProps) => {
  const imageSrc = escrow.image_url ?? "/assets/hero.webp";
  const isLocal = imageSrc.startsWith("/");
  const cancelled = isEscrowCancelled(escrow.status);
  const area = escrow.geographic_area?.trim();
  const description = escrow.description?.trim();
  const taskCount = escrow.milestones.length;
  const total = escrow.milestones.reduce(
    (sum, milestone) => sum + Number(milestone.amount),
    0,
  );

  return (
    <Link
      href={`/dashboard/escrows/${escrow.escrow_id}`}
      style={style}
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-border bg-background p-3 sm:p-4",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl bg-background-secondary">
        {isLocal ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.03]",
              cancelled && CANCELLED_ESCROW_IMAGE_CLASS,
            )}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- remote escrow covers may use any storage host
          <img
            src={imageSrc}
            alt=""
            className={cn(
              "absolute inset-0 size-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.03]",
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
            className="absolute bottom-3 right-3 font-medium"
          >
            Cancelled
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 flex min-w-0 flex-1 flex-col px-1 pb-1 sm:mt-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="line-clamp-2 break-words text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            {escrow.title}
          </h3>

          <p className="truncate text-sm text-muted-foreground">
            {escrow.community.name}
            {area ? (
              <>
                <span className="mx-1.5 text-border" aria-hidden>
                  ·
                </span>
                <span>{area}</span>
              </>
            ) : null}
          </p>

          {description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <Separator className="my-3 sm:my-4" />

        <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={escrowStatusBadgeVariant(escrow.status)}
                className="font-normal"
              >
                {formatEscrowStatusLabel(escrow.status)}
              </Badge>
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Created</dt>
            <dd className="mt-1 truncate text-sm font-medium text-foreground">
              {formatCreatedDate(escrow.created_at)}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Tasks</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {taskCount} task{taskCount === 1 ? "" : "s"}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Total</dt>
            <dd className="mt-1">
              <UsdcAmount
                amount={total}
                size="sm"
                className="font-medium text-foreground"
              />
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  );
};
