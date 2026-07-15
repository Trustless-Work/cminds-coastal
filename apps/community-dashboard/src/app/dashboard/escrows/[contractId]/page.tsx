"use client";

import { use } from "react";
import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { COMMUNITY_AUTH_SHELL } from "../../../../constants/auth-shell";
import { EscrowDetailView } from "../../../../features/escrow-create/views/EscrowDetailView";

type EscrowDetailPageProps = {
  params: Promise<{ contractId: string }>;
};

export default function EscrowDetailPage({ params }: EscrowDetailPageProps) {
  const { contractId } = use(params);

  return (
    <AuthGate {...COMMUNITY_AUTH_SHELL}>
      <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col gap-6 p-6 sm:p-8">
        <EscrowDetailView contractId={contractId} />
      </main>
    </AuthGate>
  );
}
