/**
 * Mock escrow data used while the Cursor agent wires the real
 * useEscrowsByRoleQuery.  Every component that needs live data receives
 * this as a default-prop fallback.
 *
 * Remove / replace once the real query is connected.
 */

import type { ReviewEscrow, ReviewQueueStats } from "./types";

export const MOCK_ESCROWS: ReviewEscrow[] = [
  {
    contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHK3M",
    title: "Barrier Island Seagrass Restoration — Phase 1",
    description:
      "Plant 5 000 m² of Thalassia testudinum seagrass in the northern lagoon.",
    balance: 12_500,
    trustline: { address: "USDC_ISSUER_TESTNET", decimals: 7, name: "USDC" },
    createdAt: "2025-03-15T09:00:00Z",
    updatedAt: "2025-06-01T14:22:00Z",
    milestones: [
      {
        index: 0,
        title: "Site survey & baseline",
        description: "GPS-tagged photo survey of the planting area.",
        amount: 2_500,
        evidenceLink: "https://example.com/evidence/m0",
        flags: { approved: true, disputed: false, resolved: false },
      },
      {
        index: 1,
        title: "Seagrass planting",
        description: "Physical planting of plugs across 5 000 m².",
        amount: 7_500,
        evidenceLink: "https://example.com/evidence/m1",
        flags: { approved: false, disputed: false, resolved: false },
      },
      {
        index: 2,
        title: "60-day survival check",
        description: "Photographic documentation of shoot survival rate.",
        amount: 2_500,
        evidenceLink: undefined,
        flags: { approved: false, disputed: false, resolved: false },
      },
    ],
  },
  {
    contractId: "CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBHK3M",
    title: "Coastal Mangrove Replanting — Segment C",
    description: "Re-establish mangrove buffer along 800 m of eroded shoreline.",
    balance: 0,
    trustline: { address: "USDC_ISSUER_TESTNET", decimals: 7, name: "USDC" },
    createdAt: "2025-04-10T11:30:00Z",
    updatedAt: "2025-04-10T11:30:00Z",
    milestones: [
      {
        index: 0,
        title: "Permit acquisition",
        description: "Obtain coastal works permit from state authority.",
        amount: 1_000,
        evidenceLink: "https://example.com/evidence/permit",
        flags: { approved: false, disputed: true, resolved: false },
      },
      {
        index: 1,
        title: "Propagule planting",
        description: "Plant 1 200 propagules in prepared zones.",
        amount: 5_000,
        evidenceLink: undefined,
        flags: { approved: false, disputed: false, resolved: false },
      },
    ],
  },
  {
    contractId: "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCHK3M",
    title: "Coral Reef Monitoring Network",
    description:
      "Deploy 12 permanent transect markers and conduct quarterly surveys.",
    balance: 9_000,
    trustline: { address: "USDC_ISSUER_TESTNET", decimals: 7, name: "USDC" },
    createdAt: "2025-01-20T08:00:00Z",
    updatedAt: "2025-05-28T16:45:00Z",
    milestones: [
      {
        index: 0,
        title: "Marker deployment",
        description: "Install stainless transect markers at 12 reef sites.",
        amount: 3_000,
        evidenceLink: "https://example.com/evidence/markers",
        flags: { approved: true, disputed: false, resolved: false },
      },
      {
        index: 1,
        title: "Q1 survey report",
        description: "Benthic cover and fish count data, Q1.",
        amount: 3_000,
        evidenceLink: "https://example.com/evidence/q1",
        flags: { approved: true, disputed: false, resolved: false },
      },
      {
        index: 2,
        title: "Q2 survey report",
        description: "Benthic cover and fish count data, Q2.",
        amount: 3_000,
        evidenceLink: "https://example.com/evidence/q2",
        flags: { approved: false, disputed: false, resolved: false },
      },
    ],
  },
];

export const MOCK_STATS: ReviewQueueStats = {
  totalEscrows: MOCK_ESCROWS.length,
  pendingReview: 2,
  disputed: 1,
  approved: 3,
};
