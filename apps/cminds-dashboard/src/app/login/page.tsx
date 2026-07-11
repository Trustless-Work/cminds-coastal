import { SignInView } from "@repo/features/auth/components/SignInView";
import { LoginShell } from "@repo/shared/LoginShell";

export default function LoginPage() {
  return (
    <LoginShell>
      <SignInView appRole="CMINDS_OPERATOR" dashboardHref="/dashboard" />
    </LoginShell>
  );
}
