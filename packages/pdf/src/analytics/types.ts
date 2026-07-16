export type AdminAnalyticsReportKpis = {
  communitiesActive: number;
  communitiesInactive: number;
  tasksActive: number;
  tasksInactive: number;
  escrowsTotal: number;
  plannedUsdcTotal: number;
};

export type AdminAnalyticsReportRow = {
  label: string;
  count?: number;
  amount?: number;
};

export type AdminAnalyticsReportData = {
  logoDataUrl?: string;
  generatedAt: Date;
  networkLabel: string;
  disclaimer?: string;
  kpis: AdminAnalyticsReportKpis;
  escrowsByStatus: AdminAnalyticsReportRow[];
  escrowsByCommunity: AdminAnalyticsReportRow[];
  tasksByCategory: AdminAnalyticsReportRow[];
  plannedUsdcByTaskCategory: AdminAnalyticsReportRow[];
  escrowsCreatedByMonth: AdminAnalyticsReportRow[];
};
