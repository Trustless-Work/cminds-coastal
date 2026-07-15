import { SignInView } from "@repo/features/auth/components/SignInView";
import { LoginShell } from "@repo/shared/LoginShell";

export default function LoginPage() {
  return (
    <LoginShell
      imageSrc="/assets/auth.webp"
      imageAlt="Coastal community — create and manage conservation escrows"
      logoSrc="/logos/dark-en-logo.png"
    >
      <SignInView
        appRole="COMMUNITY_IMPLEMENTER"
        dashboardHref="/dashboard"
        providers={["google", "email"]}
      />
    </LoginShell>
  );
}
