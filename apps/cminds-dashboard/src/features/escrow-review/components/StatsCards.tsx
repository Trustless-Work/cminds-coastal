"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

import type { OperatorEscrowStats } from "../types";

type StatsCardsProps = {
  stats: OperatorEscrowStats;
  isLoading?: boolean;
};

export const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const items = [
    { label: "Escrows", value: stats.totalEscrows },
    { label: "Ready for Review", value: stats.pendingReview },
    { label: "Disputed", value: stats.disputed },
    { label: "Approved / Released", value: stats.approved },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} size="sm">
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
