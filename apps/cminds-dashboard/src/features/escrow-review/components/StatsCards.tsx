"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import type { ReviewQueueStats } from "../types";

type StatsCardsProps = {
  stats: ReviewQueueStats;
  isLoading?: boolean;
};

type StatCardProps = {
  label: string;
  value: number;
  isLoading?: boolean;
};

function StatCard({ label, value, isLoading }: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-12" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Four overview stat cards shown at the top of the dashboard.
 * Props-driven — pass `isLoading` while the real query resolves.
 */
export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <section
      aria-label="Review queue statistics"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      <StatCard
        label="Total Escrows"
        value={stats.totalEscrows}
        isLoading={isLoading}
      />
      <StatCard
        label="Pending Review"
        value={stats.pendingReview}
        isLoading={isLoading}
      />
      <StatCard
        label="Disputed"
        value={stats.disputed}
        isLoading={isLoading}
      />
      <StatCard
        label="Approved"
        value={stats.approved}
        isLoading={isLoading}
      />
    </section>
  );
}
