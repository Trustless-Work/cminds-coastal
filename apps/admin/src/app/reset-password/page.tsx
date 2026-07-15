import { AuthLoginShell } from "@/features/auth/components/AuthLoginShell";
import { ResetPasswordView } from "@/features/auth/components/ResetPasswordView";

export default function ResetPasswordPage() {
  return (
    <AuthLoginShell imageAlt="Coastal conservation — set new password">
      <ResetPasswordView />
    </AuthLoginShell>
  );
}
