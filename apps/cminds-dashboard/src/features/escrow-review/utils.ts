import type { EscrowRecord } from "@repo/features/escrow/services/escrows.service";
import {
  getMilestoneAmount,
  getMilestoneFlags,
  getMilestoneReviewStatus,
  getMilestoneStatusText,
  parseLegacyEvidenceLinks,
  type MilestoneFlags,
  type MilestoneReviewStatus,
} from "@repo/helpers";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

import type { OperatorEscrowStats, ReviewQueueItem } from "./types";

export type { MilestoneFlags, MilestoneReviewStatus };
export {
  getMilestoneAmount,
  getMilestoneFlags,
  getMilestoneReviewStatus,
  getMilestoneStatusText,
};

export function getActiveMilestoneFlagLabels(flags: MilestoneFlags): string[] {
  const labels: string[] = [];
  if (flags.approved) labels.push("APPROVED");
  if (flags.disputed) labels.push("HELP");
  if (flags.released) labels.push("RELEASED");
  if (flags.resolved) labels.push("RESOLVED");
  return labels;
}

export function parseEvidenceLinks(evidence: string | undefined): string[] {
  return parseLegacyEvidenceLinks(evidence);
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
