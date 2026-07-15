import { SignInView } from "@repo/features/auth/components/SignInView";
import { LoginShell } from "@repo/shared/LoginShell";

export default function LoginPage() {
  return (
    <LoginShell
      imageSrc="/logos/assets/auth.webp"
      imageAlt="Coastal conservation — review and approve escrow tasks"
      logoSrc="/logos/dark-en-logo.png"
    >
      <SignInView
        appRole="CMINDS_OPERATOR"
        dashboardHref="/dashboard"
        providers={["email"]}
        enforceAllowedEmailDomain
      />
    </LoginShell>
  );
}
