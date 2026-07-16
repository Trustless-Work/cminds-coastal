"use client";

import type { AdminAnalyticsKpis } from "@repo/features/escrow/services/analytics.service";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

type DashboardKpiCardsProps = {
  kpis: AdminAnalyticsKpis | undefined;
  isLoading: boolean;
};

function formatUsdc(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const DashboardKpiCards = ({
  kpis,
  isLoading,
}: DashboardKpiCardsProps) => {
  if (isLoading || !kpis) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Communities",
      value: String(kpis.communitiesActive),
      description: `${kpis.communitiesInactive} inactive`,
    },
    {
      label: "Task menu",
      value: String(kpis.tasksActive),
      description: `${kpis.tasksInactive} inactive`,
    },
    {
      label: "Escrows",
      value: String(kpis.escrowsTotal),
      description: "All statuses",
    },
    {
      label: "Planned USDC",
      value: formatUsdc(kpis.plannedUsdcTotal),
      description: "Sum of milestone amounts",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {card.value}
            </CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
