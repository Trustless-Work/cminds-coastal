"use client";

import { useState } from "react";
import { networkConfig } from "@repo/config";
import type { AdminAnalyticsOverview } from "@repo/features/escrow/services/analytics.service";
import { formatEscrowStatusLabel } from "@repo/features/escrow/utils/escrow-status-display";
import {
  buildAdminAnalyticsReportPdf,
  downloadBlob,
  loadImageAsDataUrl,
  type AdminAnalyticsReportData,
} from "@repo/pdf";
import { Button } from "@repo/ui/components/button";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { Download, Loader2 } from "lucide-react";

type DownloadAnalyticsReportButtonProps = {
  data: AdminAnalyticsOverview;
};

function buildReportFilename(generatedAt: Date): string {
  const stamp = generatedAt.toISOString().slice(0, 10);
  return `cminds-analytics-report-${stamp}.pdf`;
}

function mapToReportData(
  overview: AdminAnalyticsOverview,
  logoDataUrl?: string,
): AdminAnalyticsReportData {
  const generatedAt = new Date();

  return {
    logoDataUrl,
    generatedAt,
    networkLabel: networkConfig.label,
    kpis: overview.kpis,
    escrowsByStatus: overview.escrowsByStatus.map((row) => ({
      label: formatEscrowStatusLabel(row.status),
      count: row.count,
      amount: row.plannedUsdc,
    })),
    escrowsByCommunity: overview.escrowsByCommunity.map((row) => ({
      label: row.name,
      count: row.escrowCount,
      amount: row.plannedUsdc,
    })),
    tasksByCategory: overview.tasksByCategory.map((row) => ({
      label: row.category,
      count: row.count,
    })),
    plannedUsdcByTaskCategory: overview.plannedUsdcByTaskCategory.map(
      (row) => ({
        label: row.category,
        amount: row.amount,
      }),
    ),
    escrowsCreatedByMonth: overview.escrowsCreatedByMonth
      .filter((row) => row.count > 0 || row.plannedUsdc > 0)
      .map((row) => ({
        label: row.month,
        count: row.count,
        amount: row.plannedUsdc,
      })),
  };
}

export const DownloadAnalyticsReportButton = ({
  data,
}: DownloadAnalyticsReportButtonProps) => {
  const [loading, setLoading] = useState(false);

  async function handleDownload(): Promise<void> {
    try {
      setLoading(true);

      let logoDataUrl: string | undefined;
      try {
        logoDataUrl = await loadImageAsDataUrl("/logos/dark-en-logo.png");
      } catch {
        logoDataUrl = undefined;
      }

      const reportData = mapToReportData(data, logoDataUrl);
      const blob = await buildAdminAnalyticsReportPdf(reportData);
      downloadBlob(blob, buildReportFilename(reportData.generatedAt));

      toastSuccess(
        "Report downloaded",
        "Admin analytics overview saved as PDF.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not generate report.";
      toastError("Download failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={loading}
      onClick={() => {
        void handleDownload();
      }}
    >
      {loading ? (
        <Loader2 data-icon="inline-start" className="animate-spin" />
      ) : (
        <Download data-icon="inline-start" />
      )}
      Download PDF
    </Button>
  );
};
