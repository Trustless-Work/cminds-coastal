"use client";

import { NoData } from "@repo/shared/NoData";
import { Skeleton } from "@repo/ui/components/skeleton";
import { BarChart3 } from "lucide-react";

import { AdminPageScaffold } from "@/features/admin-shell/components/AdminPageScaffold";
import { ADMIN_NAV_ITEMS } from "@/features/admin-shell/constants/nav";

import { DashboardKpiCards } from "../components/DashboardKpiCards";
import { EscrowsByCommunityChart } from "../components/EscrowsByCommunityChart";
import { EscrowsByStatusChart } from "../components/EscrowsByStatusChart";
import { EscrowsOverTimeChart } from "../components/EscrowsOverTimeChart";
import { PlannedUsdcByCategoryChart } from "../components/PlannedUsdcByCategoryChart";
import { TasksByCategoryChart } from "../components/TasksByCategoryChart";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";

export const AdminDashboardView = () => {
  const nav = ADMIN_NAV_ITEMS[0]!;
  const { data, isLoading, isError } = useAdminAnalytics();

  const hasCharts =
    !!data &&
    (data.escrowsByStatus.length > 0 ||
      data.escrowsByCommunity.length > 0 ||
      data.tasksByCategory.length > 0 ||
      data.plannedUsdcByTaskCategory.length > 0 ||
      data.escrowsCreatedByMonth.some((row) => row.count > 0));

  return (
    <AdminPageScaffold title={nav.title} description={nav.description}>
      <div className="flex flex-col gap-8">
        <DashboardKpiCards kpis={data?.kpis} isLoading={isLoading} />

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[360px] w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <NoData
            icon={<BarChart3 />}
            title="Could not load analytics"
            description="Try refreshing the page. If the problem continues, check that your admin session is still valid."
          />
        ) : null}

        {!isLoading && !isError && !hasCharts ? (
          <NoData
            icon={<BarChart3 />}
            title="No chart data yet"
            description="Create communities, tasks, and escrows to populate the dashboard charts."
          />
        ) : null}

        {!isLoading && !isError && data && hasCharts ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <EscrowsByStatusChart data={data.escrowsByStatus} />
            <EscrowsByCommunityChart data={data.escrowsByCommunity} />
            <TasksByCategoryChart data={data.tasksByCategory} />
            <PlannedUsdcByCategoryChart data={data.plannedUsdcByTaskCategory} />
            <div className="lg:col-span-2">
              <EscrowsOverTimeChart data={data.escrowsCreatedByMonth} />
            </div>
          </div>
        ) : null}
      </div>
    </AdminPageScaffold>
  );
};
