"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { FundingEscrowListView } from "../../features/escrow-fund/views/FundingEscrowListView";

export default function DashboardPage() {
  return (
    <AuthGate
      appRole="FUNDER"
      appTitle="CMinds"
      logoSrc="/logos/dark-en-logo.png"
      logoHref="/dashboard"
    >
      <FundingEscrowListView />
    </AuthGate>
  );
}
