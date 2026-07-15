"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { EscrowRecord } from "@repo/features/escrow/services/escrows.service";
import { UsdcAmount } from "@repo/shared/UsdcAmount";
import { cn } from "@repo/ui/lib/utils";

type EscrowImageCardProps = {
  escrow: EscrowRecord;
  className?: string;
  style?: CSSProperties;
};

function escrowTotal(escrow: EscrowRecord): number {
  return escrow.milestones.reduce(
    (sum, milestone) => sum + Number(milestone.amount),
    0,
  );
}

export const EscrowImageCard = ({
  escrow,
  className,
  style,
}: EscrowImageCardProps) => {
  const total = escrowTotal(escrow);
  const imageSrc = escrow.image_url ?? "/assets/funding.webp";
  const isLocal = imageSrc.startsWith("/");
  const milestoneCount = escrow.milestones.length;
  const area = escrow.geographic_area?.trim();

  return (
    <Link
      href={`/dashboard/escrows/${escrow.escrow_id}`}
      style={style}
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-border bg-background p-3 sm:p-4",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-background-secondary">
        {isLocal ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- remote escrow covers may use any storage host
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="mt-3 flex min-w-0 flex-1 flex-col gap-2 px-1 pb-1 sm:mt-4">
        <h3 className="line-clamp-2 break-words text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
          {escrow.title}
        </h3>

        <div className="mt-auto flex min-w-0 flex-col gap-1">
          <p className="truncate text-sm text-muted-foreground">
            {escrow.community_name}
            {area ? (
              <>
                <span className="mx-1.5 text-border" aria-hidden>
                  ·
                </span>
                <span>{area}</span>
              </>
            ) : null}
          </p>
          <p className="flex min-w-0 items-center gap-1.5 truncate text-sm text-muted-foreground">
            <span className="shrink-0">
              {milestoneCount} task{milestoneCount === 1 ? "" : "s"}
            </span>
            <span className="shrink-0 text-border" aria-hidden>
              ·
            </span>
            <UsdcAmount
              amount={total}
              size="sm"
              className="font-medium text-foreground"
            />
          </p>
        </div>
      </div>
    </Link>
  );
};
