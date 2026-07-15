"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  ClipboardCheck,
  FileStack,
  ShieldAlert,
} from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";

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
      label: "Ready for Review",
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
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[24px] sm:h-36" />
        ))}
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4">
      {items.map((item, index) => {
        const style: CSSProperties = {
          animationDelay: `${index * 60}ms`,
        };
        return (
          <li
            key={item.id}
            style={style}
            className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex flex-col gap-3 rounded-[24px] border border-border bg-background p-4 duration-500 sm:gap-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="pt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                {item.label}
              </p>
              <DuotoneIcon
                icon={item.icon}
                sizeClassName="size-10 sm:size-12"
              />
            </div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
              {item.value ?? "—"}
            </p>
          </li>
        );
      })}
    </ul>
  );
};
