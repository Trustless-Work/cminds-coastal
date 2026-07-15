import { AdminAuthGate } from "@/features/auth/components/AdminAuthGate";

export default function DashboardPage() {
  return (
    <AdminAuthGate>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-2 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in with email/password and authenticator (AAL2). More admin
          tools will land here.
        </p>
      </main>
    </AdminAuthGate>
  );
}
