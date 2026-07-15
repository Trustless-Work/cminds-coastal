"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { OperatorDashboardView } from "../../features/escrow-review/views/OperatorDashboardView";

export default function DashboardPage() {
  return (
    <AuthGate
      appRole="CMINDS_OPERATOR"
      appTitle="CMinds"
      logoSrc="/logos/dark-en-logo.png"
      logoHref="/dashboard"
    >
      <OperatorDashboardView />
    </AuthGate>
  );
}
