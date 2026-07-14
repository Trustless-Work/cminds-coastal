"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";
import { MilestoneReviewQueue } from "@/features/escrow-review/components/MilestoneReviewQueue";
import { StatsCards } from "@/features/escrow-review/components/StatsCards";
import { EscrowListView } from "@/features/escrow-review/components/EscrowListView";
import { MOCK_ESCROWS, MOCK_STATS } from "@/features/escrow-review/mock";

/**
 * /dashboard
 *
 * Overview page for the CMinds operator.
 * Shows:
 *   1. Stats summary cards
 *   2. Review queue — milestones with evidence ready to approve/dispute
 *   3. Full escrow list (cards on mobile, table on md+)
 *
 * Data wiring (Cursor agent):
 *   Replace MOCK_ESCROWS / MOCK_STATS with:
 *     const { data: escrows = [], isLoading, error } = useEscrowsByRoleQuery({
 *       role: "approver",
 *       roleAddress: walletAddress,
 *     });
 *   Derive stats by reducing escrows.
 */
export default function DashboardPage() {
  // TODO (Cursor agent): replace with real query + walletAddress from usePollar / useWalletContext
  const escrows = MOCK_ESCROWS;
  const stats = MOCK_STATS;
  const isLoading = false;

  return (
    <AuthGate
      appRole="CMINDS_OPERATOR"
      appTitle="CMinds"
      appSubtitle="Operator dashboard"
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6 sm:p-8">
        {/* Page heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Review milestones, approve evidence, and manage escrows.
          </p>
        </div>

        {/* Stats row */}
        <StatsCards stats={stats} isLoading={isLoading} />

        {/* Milestones ready for review + open disputes */}
        <MilestoneReviewQueue escrows={escrows} isLoading={isLoading} />

        {/* Full escrow list */}
        <EscrowListView escrows={escrows} isLoading={isLoading} />
      </main>
    </AuthGate>
  );
}
