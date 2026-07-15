"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { COMMUNITY_AUTH_SHELL } from "../../constants/auth-shell";
import { CommunityDashboardView } from "../../features/escrow-create/views/CommunityDashboardView";

export default function DashboardPage() {
  return (
    <AuthGate {...COMMUNITY_AUTH_SHELL}>
      <CommunityDashboardView />
    </AuthGate>
  );
}
