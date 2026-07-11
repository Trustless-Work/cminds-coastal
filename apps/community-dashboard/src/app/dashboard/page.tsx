import { AuthGate } from "@repo/features/auth/components/AuthGate";

export default function DashboardPage() {
  return (
    <AuthGate appRole="COMMUNITY_IMPLEMENTER">
      <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
        <h1 className="text-2xl font-semibold">Community Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          You are signed in as a community implementer.
        </p>
      </main>
    </AuthGate>
  );
}
