"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";
import { InitializeEscrowDialog } from "@repo/tw-blocks/escrows/multi-release/initialize-escrow/dialog/InitializeEscrow";

export default function DashboardPage() {
  return (
    <AuthGate appRole="CMINDS_OPERATOR">
      <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
        <h1 className="text-2xl font-semibold">CMinds Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          You are signed in as a CMinds operator.
        </p>
      </main>
      <InitializeEscrowDialog />
    </AuthGate>
  );
}
