"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { EscrowRecord } from "@repo/features/escrow/services/escrows.service";
import { formatCurrency } from "@repo/helpers";
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
  const imageSrc = escrow.image_url ?? "/assets/funding.jpeg";
  const isLocal = imageSrc.startsWith("/");
  const milestoneCount = escrow.milestones.length;
  const area = escrow.geographic_area?.trim();

  return (
    <Link
      href={`/dashboard/escrows/${escrow.escrow_id}`}
      style={style}
      className={cn(
        "group block transition-transform duration-[250ms] ease-out hover:-translate-y-1 hover:scale-[1.02]",
        className,
      )}
    >
      <article>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          {isLocal ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.02]"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- remote escrow covers may use any storage host
            <img
              src={imageSrc}
              alt=""
              className="absolute inset-0 size-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.02]"
            />
          )}
        </div>
        <div className="mt-3 space-y-1 px-0.5">
          <h3 className="text-[22px] font-semibold leading-snug tracking-tight text-foreground sm:text-[26px]">
            {escrow.title}
          </h3>
          <p className="text-sm text-muted-foreground sm:text-[15px]">
            {escrow.community_name}
            {area ? ` · ${area}` : ""}
            {` · ${milestoneCount} milestone${milestoneCount === 1 ? "" : "s"}`}
            {` · ${formatCurrency(total, "USDC")}`}
          </p>
        </div>
      </article>
    </Link>
  );
};
