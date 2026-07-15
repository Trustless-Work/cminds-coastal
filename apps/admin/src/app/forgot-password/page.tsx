import { AuthLoginShell } from "@/features/auth/components/AuthLoginShell";
import { ForgotPasswordView } from "@/features/auth/components/ForgotPasswordView";

export default function ForgotPasswordPage() {
  return (
    <AuthLoginShell imageAlt="Coastal conservation — password recovery">
      <ForgotPasswordView />
    </AuthLoginShell>
  );
}
