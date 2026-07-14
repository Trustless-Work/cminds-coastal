"use client";

import { use } from "react";
import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { EscrowDetailPageView } from "../../../../features/escrow-review/views/EscrowDetailPageView";

type EscrowDetailPageProps = {
  params: Promise<{ contractId: string }>;
};

export default function EscrowDetailPage({ params }: EscrowDetailPageProps) {
  const { contractId } = use(params);

  return (
    <AuthGate
      appRole="CMINDS_OPERATOR"
      appTitle="CMinds"
      appSubtitle="Operator dashboard"
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <EscrowDetailPageView contractId={contractId} />
      </main>
    </AuthGate>
  );
}
