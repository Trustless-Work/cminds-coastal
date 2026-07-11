import { AuthGate } from "@repo/features/auth/components/AuthGate";

export default function DashboardPage() {
  return (
    <AuthGate appRole="FUNDER">
      <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
        <h1 className="text-2xl font-semibold">Funding Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          You are signed in as a funder.
        </p>
      </main>
    </AuthGate>
  );
}
