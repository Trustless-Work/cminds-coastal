import type { MilestoneStatus, ReviewMilestone } from "./types";

/**
 * Derive a single display status from milestone flags + evidenceLink.
 * Priority: resolved > disputed > approved > evidence_ready > pending
 */
export function getMilestoneStatus(milestone: ReviewMilestone): MilestoneStatus {
  const { flags, evidenceLink } = milestone;
  if (flags.resolved) return "resolved";
  if (flags.disputed) return "disputed";
  if (flags.approved) return "approved";
  if (evidenceLink) return "evidence_ready";
  return "pending";
}

/** Human-readable label for a milestone status */
export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  pending: "Pending",
  evidence_ready: "Evidence Ready",
  approved: "Approved",
  disputed: "Disputed",
  resolved: "Resolved",
};

/**
 * Badge variant mapping for @repo/ui Badge component.
 * Matches the variants defined in packages/ui/src/components/badge.tsx.
 */
export const MILESTONE_STATUS_VARIANT: Record<
  MilestoneStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  evidence_ready: "secondary",
  approved: "default",
  disputed: "destructive",
  resolved: "secondary",
};

/**
 * Shorten a Stellar contract/wallet address for display.
 * e.g. "CAAA...HK3M"
 */
export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Count milestones in the "evidence_ready" state — these need operator review */
export function countPendingReview(milestones: ReviewMilestone[]): number {
  return milestones.filter((m) => getMilestoneStatus(m) === "evidence_ready").length;
}
