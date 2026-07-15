"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { CommunityDashboardView } from "../../features/escrow-create/views/CommunityDashboardView";

export default function DashboardPage() {
  return (
    <AuthGate
      appRole="COMMUNITY_IMPLEMENTER"
      appTitle="CMinds"
      logoSrc="/logos/dark-en-logo.png"
      logoHref="/dashboard"
    >
      <CommunityDashboardView />
    </AuthGate>
  );
}
