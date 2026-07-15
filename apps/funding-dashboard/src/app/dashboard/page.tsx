"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { FUNDING_NAV } from "../../features/escrow-fund/constants/nav";
import { FundingEscrowListView } from "../../features/escrow-fund/views/FundingEscrowListView";

export default function DashboardPage() {
  return (
    <AuthGate
      appRole="FUNDER"
      appTitle="CMinds"
      logoSrc="/logos/dark-en-logo.png"
      logoHref="/dashboard"
      navLinks={FUNDING_NAV}
    >
      <FundingEscrowListView />
    </AuthGate>
  );
}
