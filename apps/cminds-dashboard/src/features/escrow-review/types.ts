/**
 * escrow-review feature — shared types
 *
 * These types mirror the relevant fields from GetEscrowsFromIndexerResponse
 * (@trustless-work/escrow/types) but are scoped to what the CMinds operator
 * UI needs.  The Cursor agent passes the real TW objects down; we cast them
 * to these shapes in the component boundary so the presentation layer stays
 * decoupled from the SDK types.
 */

export type MilestoneFlag = {
  approved: boolean;
  disputed: boolean;
  resolved: boolean;
};

/**
 * A single multi-release milestone as understood by the review UI.
 */
export type ReviewMilestone = {
  /** Original index inside the escrow.milestones array — required by tw-blocks action buttons */
  index: number;
  title: string;
  description?: string;
  /** Fixed USDC amount (not a %) */
  amount: number;
  /** URL to supporting evidence supplied by the community implementer */
  evidenceLink?: string;
  flags: MilestoneFlag;
};

/** Derived status computed from flags for display purposes */
export type MilestoneStatus =
  | "pending"       // no flags set, evidence not submitted yet
  | "evidence_ready" // evidence link present but not yet approved/disputed
  | "approved"
  | "disputed"
  | "resolved";

/** Funding state of the escrow contract */
export type FundingStatus = "unfunded" | "funded" | "partial";

/**
 * Minimal escrow shape needed by the CMinds review UI.
 * Built from GetEscrowsFromIndexerResponse fields.
 */
export type ReviewEscrow = {
  contractId: string;
  title: string;
  description?: string;
  /** On-chain USDC balance */
  balance: number;
  /** Trustline / token info */
  trustline: {
    address: string;
    decimals: number;
    name?: string;
  };
  milestones: ReviewMilestone[];
  /** ISO string or null */
  createdAt?: string;
  /** ISO string or null */
  updatedAt?: string;
};

/** Stats surfaced on the dashboard overview cards */
export type ReviewQueueStats = {
  totalEscrows: number;
  pendingReview: number;
  disputed: number;
  approved: number;
};
