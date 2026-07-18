"use client";

import { use } from "react";
import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { FundingEscrowDetailView } from "../../../../features/escrow-fund/views/FundingEscrowDetailView";
import { FUNDING_AUTH_SHELL } from "../../../../constants/auth-shell";

type EscrowDetailPageProps = {
  params: Promise<{ contractId: string }>;
};

export default function EscrowDetailPage({ params }: EscrowDetailPageProps) {
  const { contractId } = use(params);

  return (
    <AuthGate {...FUNDING_AUTH_SHELL}>
      <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-6 pb-24 pt-6 sm:px-10">
        <FundingEscrowDetailView contractId={contractId} />
      </main>
    </AuthGate>
  );
}
