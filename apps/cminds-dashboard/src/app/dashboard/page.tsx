"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { OperatorDashboardView } from "../../features/escrow-review/views/OperatorDashboardView";

export default function DashboardPage() {
  return (
    <AuthGate
      appRole="CMINDS_OPERATOR"
      appTitle="CMinds"
      appSubtitle="Operator dashboard"
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Review tasks, approve evidence, and manage escrows.
          </p>
        </div>
        <OperatorDashboardView />
      </main>
    </AuthGate>
  );
}
