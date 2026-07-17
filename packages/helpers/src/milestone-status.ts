export type MilestoneReviewStatus =
  | "pending"
  | "in_progress"
  | "ready_for_review"
  | "approved"
  | "disputed"
  | "released"
  | "resolved";

export type MilestoneFlags = {
  approved?: boolean;
  disputed?: boolean;
  released?: boolean;
  resolved?: boolean;
};

export type MilestoneStatusInput = {
  status?: string | null;
  evidence?: string | null;
  amount?: number;
  description?: string;
  approved?: boolean;
  flags?: MilestoneFlags;
};

const READY_STATUS_RE = /ready\s*for\s*review|completed|submitted/i;

export const MILESTONE_STATUS_COLORS: Record<MilestoneReviewStatus, string> = {
  pending: "#666666",
  in_progress: "#1F4E79",
  ready_for_review: "#B45309",
  approved: "#0F766E",
  disputed: "#B91C1C",
  released: "#166534",
  resolved: "#374151",
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneReviewStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  ready_for_review: "Ready for Review",
  approved: "Approved",
  disputed: "Help",
  released: "Released",
  resolved: "Resolved",
};

export function getMilestoneFlags(
  milestone: MilestoneStatusInput,
): MilestoneFlags {
  if (milestone.flags) {
    return milestone.flags;
  }
  return { approved: milestone.approved };
}

export function getMilestoneStatusText(
  milestone: MilestoneStatusInput,
): string {
  return milestone.status?.trim() || "Pending";
}

export function getActiveMilestoneFlagLabels(
  flags: MilestoneFlags,
): string[] {
  const labels: string[] = [];
  if (flags.approved) labels.push("APPROVED");
  if (flags.disputed) labels.push("HELP");
  if (flags.released) labels.push("RELEASED");
  if (flags.resolved) labels.push("RESOLVED");
  return labels;
}

export function getMilestoneAmount(
  milestone: MilestoneStatusInput,
): number | null {
  return typeof milestone.amount === "number" ? milestone.amount : null;
}

export function getMilestoneReviewStatus(
  milestone: MilestoneStatusInput,
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

export type MilestonePieSlice = {
  id: string;
  title: string;
  status: MilestoneReviewStatus;
  amount: number | null;
  hasEvidence: boolean;
};

export function buildMilestonePieSlices(
  milestones: MilestoneStatusInput[],
): MilestonePieSlice[] {
  return milestones.map((milestone, index) => {
    const status = getMilestoneReviewStatus(milestone);
    return {
      id: `milestone-${index}`,
      title: milestone.description?.trim() || `Milestone ${index + 1}`,
      status,
      amount: getMilestoneAmount(milestone),
      hasEvidence: Boolean(milestone.evidence?.trim()),
    };
  });
}
