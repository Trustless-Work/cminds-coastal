import type { EscrowRecord } from "@repo/features/escrow/services/escrows.service";
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
  statusText: string;
  flags: {
    approved?: boolean;
    disputed?: boolean;
    released?: boolean;
    resolved?: boolean;
  };
  metadata?: EscrowRecord | null;
};

export type OperatorEscrowStats = {
  totalEscrows: number;
  pendingReview: number;
  disputed: number;
  approved: number;
};

export type EnrichedOperatorEscrow = {
  metadata: EscrowRecord;
  chain?: Escrow;
  pendingReviewCount: number;
  disputedCount: number;
};
