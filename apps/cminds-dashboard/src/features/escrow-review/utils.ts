import type { EscrowRecord } from "@repo/features/escrow/services/escrows.service";
import type {
  GetEscrowsFromIndexerResponse as Escrow,
  MultiReleaseMilestone,
  SingleReleaseMilestone,
} from "@trustless-work/escrow/types";

import type {
  MilestoneReviewStatus,
  OperatorEscrowStats,
  ReviewQueueItem,
} from "./types";

const READY_STATUS_RE = /ready\s*for\s*review|completed|submitted/i;

function isMultiMilestone(
  milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): milestone is MultiReleaseMilestone {
  return "amount" in milestone;
}

export type MilestoneFlags = {
  approved?: boolean;
  disputed?: boolean;
  released?: boolean;
  resolved?: boolean;
};

export function getMilestoneFlags(
  milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): MilestoneFlags {
  if (isMultiMilestone(milestone)) {
    return milestone.flags ?? {};
  }
  return { approved: milestone.approved };
}

export function getMilestoneStatusText(
  milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): string {
  return milestone.status?.trim() || "Pending";
}

export function getActiveMilestoneFlagLabels(flags: MilestoneFlags): string[] {
  const labels: string[] = [];
  if (flags.approved) labels.push("APPROVED");
  if (flags.disputed) labels.push("DISPUTED");
  if (flags.released) labels.push("RELEASED");
  if (flags.resolved) labels.push("RESOLVED");
  return labels;
}

export function getMilestoneAmount(
  milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): number | null {
  return isMultiMilestone(milestone) ? milestone.amount : null;
}

export function getMilestoneReviewStatus(
  milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): MilestoneReviewStatus {
  const flags = getMilestoneFlags(milestone);

  if (flags.released) return "released";
  if (flags.resolved) return "resolved";
  if (flags.disputed) return "disputed";
  if (flags.approved) return "approved";

  const statusText = milestone.status?.trim() ?? "";
  const hasEvidence = Boolean(milestone.evidence?.trim());

  if (hasEvidence || READY_STATUS_RE.test(statusText)) {
    return "ready_for_review";
  }

  if (statusText.length > 0) return "in_progress";
  return "pending";
}

export function parseEvidenceLinks(evidence: string | undefined): string[] {
  if (!evidence?.trim()) return [];

  const urls = evidence.match(/https?:\/\/[^\s,;]+/gi);
  if (urls && urls.length > 0) {
    return urls.map((url) => url.replace(/[),.;]+$/, ""));
  }

  const trimmed = evidence.trim();
  if (/^https?:\/\//i.test(trimmed)) return [trimmed];
  return [];
}

export function buildReviewQueue(
  escrows: Escrow[],
  metadataByContractId?: Map<string, EscrowRecord | null>,
): ReviewQueueItem[] {
  const items: ReviewQueueItem[] = [];

  for (const escrow of escrows) {
    escrow.milestones.forEach((milestone, milestoneIndex) => {
      const status = getMilestoneReviewStatus(milestone);
      if (status !== "ready_for_review" && status !== "disputed") return;

      items.push({
        escrow,
        milestoneIndex,
        milestoneDescription: milestone.description,
        amount: getMilestoneAmount(milestone),
        evidence: milestone.evidence,
        status,
        statusText: getMilestoneStatusText(milestone),
        flags: getMilestoneFlags(milestone),
        metadata:
          escrow.contractId !== undefined
            ? (metadataByContractId?.get(escrow.contractId) ?? null)
            : null,
      });
    });
  }

  return items;
}

export function computeOperatorStats(escrows: Escrow[]): OperatorEscrowStats {
  let pendingReview = 0;
  let disputed = 0;
  let approved = 0;

  for (const escrow of escrows) {
    for (const milestone of escrow.milestones) {
      const status = getMilestoneReviewStatus(milestone);
      if (status === "ready_for_review") pendingReview += 1;
      if (status === "disputed") disputed += 1;
      if (status === "approved" || status === "released") approved += 1;
    }
  }

  return {
    totalEscrows: escrows.length,
    pendingReview,
    disputed,
    approved,
    completed: 0,
  };
}

export function fundingLabelFromBalance(balance: number | undefined): string {
  if (!balance || balance <= 0) return "Unfunded";
  return "Funded";
}
