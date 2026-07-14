"use client";

import { use } from "react";
import { AuthGate } from "@repo/features/auth/components/AuthGate";
import { EscrowDetailView } from "@/features/escrow-review/components/EscrowDetailView";
import { MOCK_ESCROWS } from "@/features/escrow-review/mock";

type EscrowDetailPageProps = {
  params: Promise<{ contractId: string }>;
};

/**
 * /dashboard/escrows/[contractId]
 *
 * Full detail view for a single escrow — shows all milestones with
 * their evidence links, amounts, and action slots.
 *
 * Data wiring (Cursor agent):
 *   Replace the mock lookup with a real query, e.g.:
 *     const { data: escrows = [], isLoading, error } = useEscrowsByRoleQuery({
 *       role: "approver",
 *       roleAddress: walletAddress,
 *     });
 *     const escrow = escrows.find((e) => e.contractId === contractId) ?? null;
 *
 *   Then call setSelectedEscrow / setUserRolesInEscrow before rendering
 *   action buttons so tw-blocks picks up the correct context:
 *     useEffect(() => {
 *       if (escrow) {
 *         setSelectedEscrow(escrow);
 *         setUserRolesInEscrow(["approver"]);
 *       }
 *     }, [escrow]);
 */
export default function EscrowDetailPage({ params }: EscrowDetailPageProps) {
  const { contractId } = use(params);

  // TODO (Cursor agent): replace with real useEscrowsByRoleQuery + contractId lookup
  const escrow =
    MOCK_ESCROWS.find((e) => e.contractId === contractId) ?? null;
  const isLoading = false;
  const error: string | null = null;

  return (
    <AuthGate
      appRole="CMINDS_OPERATOR"
      appTitle="CMinds"
      appSubtitle="Operator dashboard"
    >
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <EscrowDetailView
          escrow={escrow}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </AuthGate>
  );
}
