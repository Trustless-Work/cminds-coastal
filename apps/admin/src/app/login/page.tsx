import { Suspense } from "react";

import { AdminSignInView } from "@/features/auth/components/AdminSignInView";
import { AuthLoginShell } from "@/features/auth/components/AuthLoginShell";

export default function LoginPage() {
  return (
    <AuthLoginShell>
      <Suspense fallback={null}>
        <AdminSignInView />
      </Suspense>
    </AuthLoginShell>
  );
}
