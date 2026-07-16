"use client";

import { useState } from "react";
import { networkConfig } from "@repo/config";
import type {
  EscrowMilestoneRecord,
  EscrowRecord,
} from "@repo/features/escrow/services/escrows.service";
import {
  buildTaskInvoicePdf,
  downloadBlob,
  loadImageAsDataUrl,
  type TaskInvoiceData,
  type TaskInvoiceSettlementType,
} from "@repo/pdf";
import { IconActionButton } from "@repo/ui/components/icon-action-button";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import type { MultiReleaseMilestone } from "@trustless-work/escrow/types";
import { Download } from "lucide-react";

type DownloadTaskInvoiceButtonProps = {
  escrow: Escrow;
  metadata: EscrowRecord;
  milestoneIndex: number;
  settlementType: TaskInvoiceSettlementType;
};

function isMultiMilestone(
  milestone: Escrow["milestones"][number],
): milestone is MultiReleaseMilestone {
  return "amount" in milestone;
}

function buildInvoiceFilename(
  taskCode: string,
  contractId: string,
): string {
  const shortContract =
    contractId.length > 12
      ? `${contractId.slice(0, 6)}-${contractId.slice(-4)}`
      : contractId;
  return `invoice-${taskCode}-${shortContract}.pdf`;
}

function mapToInvoiceData(params: {
  escrow: Escrow;
  metadata: EscrowRecord;
  milestoneIndex: number;
  settlementType: TaskInvoiceSettlementType;
  logoDataUrl?: string;
}): TaskInvoiceData {
  const { escrow, metadata, milestoneIndex, settlementType, logoDataUrl } =
    params;
  const chainMilestone = escrow.milestones[milestoneIndex];
  const metaMilestone: EscrowMilestoneRecord | undefined =
    metadata.milestones[milestoneIndex];

  const amount =
    chainMilestone && isMultiMilestone(chainMilestone)
      ? chainMilestone.amount
      : Number(metaMilestone?.amount ?? 0);

  const receiver =
    chainMilestone && isMultiMilestone(chainMilestone)
      ? chainMilestone.receiver?.trim()
      : undefined;

  const payees =
    receiver && receiver.length > 0
      ? [{ address: receiver, amount }]
      : [];

  const taskCode = metaMilestone?.task.code ?? `M${milestoneIndex + 1}`;
  const taskName =
    metaMilestone?.task.name ??
    chainMilestone?.description ??
    `Milestone ${milestoneIndex + 1}`;

  return {
    logoDataUrl,
    escrow: {
      title: metadata.title || escrow.title,
      communityName: metadata.community?.name,
      contractId: escrow.contractId || metadata.escrow_id,
      engagementId: metadata.engagement_id || escrow.engagementId,
      geographicArea: metadata.geographic_area ?? undefined,
      assetSymbol: escrow.trustline?.symbol ?? "USDC",
    },
    task: {
      code: taskCode,
      category: metaMilestone?.task.category,
      name: taskName,
      deliverable: metaMilestone?.task.expected_deliverable,
      milestoneIndex,
    },
    payment: {
      amount,
      settlementType,
      payees,
      generatedAt: new Date(),
    },
    roles: {
      approver: escrow.roles?.approver,
      releaseSigner: escrow.roles?.releaseSigner,
      disputeResolver: escrow.roles?.disputeResolver,
    },
    footer: {
      networkLabel: networkConfig.label,
    },
  };
}

export const DownloadTaskInvoiceButton = ({
  escrow,
  metadata,
  milestoneIndex,
  settlementType,
}: DownloadTaskInvoiceButtonProps) => {
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

      const invoiceData = mapToInvoiceData({
        escrow,
        metadata,
        milestoneIndex,
        settlementType,
        logoDataUrl,
      });

      const blob = await buildTaskInvoicePdf(invoiceData);
      const filename = buildInvoiceFilename(
        invoiceData.task.code,
        invoiceData.escrow.contractId,
      );
      downloadBlob(blob, filename);

      toastSuccess("Invoice downloaded", "Task payment receipt saved as PDF.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not generate invoice.";
      toastError("Download failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TooltipProvider delay={200}>
      <div className="flex flex-wrap items-center gap-2">
        <IconActionButton
          label="Download invoice"
          icon={<Download className="size-4" />}
          onClick={() => {
            void handleDownload();
          }}
          loading={loading}
        />
      </div>
    </TooltipProvider>
  );
};
