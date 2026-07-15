import { SignInView } from "@repo/features/auth/components/SignInView";
import { LoginShell } from "@repo/shared/LoginShell";

export default function LoginPage() {
  return (
    <LoginShell
      imageSrc="/assets/auth.webp"
      imageAlt="Coastal landscape — fund conservation work with escrow"
      logoSrc="/logos/dark-en-logo.png"
    >
      <SignInView
        appRole="FUNDER"
        dashboardHref="/dashboard"
        providers={["google", "email"]}
      />
    </LoginShell>
  );
}
