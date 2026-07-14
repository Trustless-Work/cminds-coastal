"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { CreateEscrowView } from "../../../../features/escrow-create/views/CreateEscrowView";

export default function CreateEscrowPage() {
  return (
    <AuthGate
      appRole="COMMUNITY_IMPLEMENTER"
      appTitle="Community"
      appSubtitle="Implementer dashboard"
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <CreateEscrowView />
      </main>
    </AuthGate>
  );
}
