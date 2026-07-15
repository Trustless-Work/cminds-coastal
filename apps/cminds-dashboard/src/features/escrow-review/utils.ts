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

export function getMilestoneFlags(
  milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): {
  approved?: boolean;
  disputed?: boolean;
  released?: boolean;
  resolved?: boolean;
} {
  if (isMultiMilestone(milestone)) {
    return milestone.flags ?? {};
  }
  return { approved: milestone.approved };
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

export function milestoneStatusLabel(status: MilestoneReviewStatus): string {
  switch (status) {
    case "ready_for_review":
      return "Ready for Review";
    case "in_progress":
      return "In Progress";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function milestoneStatusVariant(
  status: MilestoneReviewStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ready_for_review":
      return "default";
    case "approved":
    case "released":
    case "resolved":
      return "secondary";
    case "disputed":
      return "destructive";
    default:
      return "outline";
  }
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
  };
}

export function fundingLabelFromBalance(balance: number | undefined): string {
  if (!balance || balance <= 0) return "Unfunded";
  return "Funded";
}
