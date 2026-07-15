"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { COMMUNITY_AUTH_SHELL } from "../../../../constants/auth-shell";
import { CreateEscrowView } from "../../../../features/escrow-create/views/CreateEscrowView";

export default function CreateEscrowPage() {
  return (
    <AuthGate {...COMMUNITY_AUTH_SHELL}>
      <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col p-6 sm:p-8">
        <CreateEscrowView />
      </main>
    </AuthGate>
  );
}
