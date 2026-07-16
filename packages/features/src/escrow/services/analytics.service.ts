import { http } from "@repo/config";

export type AdminAnalyticsKpis = {
  communitiesActive: number;
  communitiesInactive: number;
  tasksActive: number;
  tasksInactive: number;
  escrowsTotal: number;
  plannedUsdcTotal: number;
};

export type EscrowsByCommunityRow = {
  name: string;
  escrowCount: number;
  plannedUsdc: number;
};

export type TasksByCategoryRow = {
  category: string;
  count: number;
};

export type PlannedUsdcByTaskCategoryRow = {
  category: string;
  amount: number;
};

export type EscrowsByStatusRow = {
  status: string;
  count: number;
  plannedUsdc: number;
};

export type EscrowsCreatedByMonthRow = {
  month: string;
  count: number;
  plannedUsdc: number;
};

export type AdminAnalyticsOverview = {
  kpis: AdminAnalyticsKpis;
  escrowsByCommunity: EscrowsByCommunityRow[];
  tasksByCategory: TasksByCategoryRow[];
  plannedUsdcByTaskCategory: PlannedUsdcByTaskCategoryRow[];
  escrowsByStatus: EscrowsByStatusRow[];
  escrowsCreatedByMonth: EscrowsCreatedByMonthRow[];
};

export async function fetchAdminAnalytics(): Promise<AdminAnalyticsOverview> {
  const { data } = await http.get<AdminAnalyticsOverview>("/analytics/admin");
  return data;
}
