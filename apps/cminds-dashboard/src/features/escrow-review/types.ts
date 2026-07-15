import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

export type MilestoneReviewStatus =
  | "pending"
  | "in_progress"
  | "ready_for_review"
  | "approved"
  | "disputed"
  | "released"
  | "resolved";

export type ReviewQueueItem = {
  escrow: Escrow;
  milestoneIndex: number;
  milestoneDescription: string;
  amount: number | null;
  evidence: string | undefined;
  status: MilestoneReviewStatus;
};

export type OperatorEscrowStats = {
  totalEscrows: number;
  pendingReview: number;
  disputed: number;
  approved: number;
};
