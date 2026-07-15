"use client";

import { AuthGate } from "@repo/features/auth/components/AuthGate";

import { FUNDING_NAV } from "../../../features/escrow-fund/constants/nav";

export default function InvestmentsPage() {
  return (
    <AuthGate
      appRole="FUNDER"
      appTitle="CMinds"
      logoSrc="/logos/dark-en-logo.png"
      logoHref="/dashboard"
      navLinks={FUNDING_NAV}
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            My Investments
          </h1>
          <p className="text-sm text-muted-foreground">
            Escrows you have funded will appear here.
          </p>
        </div>
      </main>
    </AuthGate>
  );
}
