"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CircleCheck,
  ClipboardCheck,
  FileStack,
  ShieldAlert,
} from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

import type { OperatorEscrowStats } from "../types";
import { DuotoneIcon } from "./DuotoneIcon";

type OperatorStatsCardsProps = {
  stats: OperatorEscrowStats;
  isLoading?: boolean;
};

type StatItem = {
  id: string;
  label: string;
  value: number | null;
  icon: LucideIcon;
};

/**
 * Responsive spans for 5 stats:
 * - mobile 2-col: last card full width
 * - md 6-col: first row 3×span-2, second row 2×span-3
 * - xl 5-col: equal columns
 */
function statSpanClass(index: number, total: number): string {
  const isLast = index === total - 1;
  const isSecondRowOnMd = index >= 3;

  return cn(
    isLast && "col-span-2",
    "md:col-span-2",
    isSecondRowOnMd && "md:col-span-3",
    "xl:col-span-1",
  );
}

export const OperatorStatsCards = ({
  stats,
  isLoading,
}: OperatorStatsCardsProps) => {
  const items: StatItem[] = [
    {
      id: "escrows",
      label: "Escrows",
      value: isLoading ? null : stats.totalEscrows,
      icon: FileStack,
    },
    {
      id: "ready",
      label: "Ready",
      value: isLoading ? null : stats.pendingReview,
      icon: ClipboardCheck,
    },
    {
      id: "disputed",
      label: "Disputed",
      value: isLoading ? null : stats.disputed,
      icon: ShieldAlert,
    },
    {
      id: "approved",
      label: "Approved",
      value: isLoading ? null : stats.approved,
      icon: BadgeCheck,
    },
    {
      id: "completed",
      label: "Completed",
      value: isLoading ? null : stats.completed,
      icon: CircleCheck,
    },
  ];

  const gridClassName =
    "grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-5 xl:grid-cols-5 xl:gap-6";

  if (isLoading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn(
              "h-28 rounded-[24px] sm:h-32",
              statSpanClass(index, 5),
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <ul className={gridClassName}>
      {items.map((item, index) => {
        const style: CSSProperties = {
          animationDelay: `${index * 60}ms`,
        };

        return (
          <li
            key={item.id}
            style={style}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex min-w-0 flex-col justify-between gap-6 rounded-[24px] border border-border bg-background p-5 duration-500 sm:gap-8 sm:p-6",
              statSpanClass(index, items.length),
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 pt-0.5 text-sm font-medium text-muted-foreground">
                {item.label}
              </p>
              <DuotoneIcon
                icon={item.icon}
                sizeClassName="size-9 shrink-0 sm:size-10"
              />
            </div>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl">
              {item.value ?? "—"}
            </p>
          </li>
        );
      })}
    </ul>
  );
};
