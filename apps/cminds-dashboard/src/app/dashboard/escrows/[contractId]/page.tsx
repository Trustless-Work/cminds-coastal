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
      logoSrc="/logos/dark-en-logo.png"
      logoHref="/dashboard"
    >
      <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-6 pb-24 pt-6 sm:px-10">
        <EscrowDetailPageView contractId={contractId} />
      </main>
    </AuthGate>
  );
}
