import { SignInView } from "@repo/features/auth/components/SignInView";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <SignInView
        className="w-full max-w-4xl"
        appRole="COMMUNITY_IMPLEMENTER"
        dashboardHref="/dashboard"
      />
    </main>
  );
}
