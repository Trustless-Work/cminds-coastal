"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { FundingEscrowListView } from "../../features/escrow-fund/views/FundingEscrowListView";

const FUNDING_NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard", label: "Escrows" },
  { href: "/dashboard", label: "Fund" },
];

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
