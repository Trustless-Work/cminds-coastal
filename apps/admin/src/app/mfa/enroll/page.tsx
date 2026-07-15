import { Suspense } from "react";

import { AuthLoginShell } from "@/features/auth/components/AuthLoginShell";
import { TotpEnrollView } from "@/features/auth/components/TotpEnrollView";

export default function MfaEnrollPage() {
  return (
    <AuthLoginShell imageAlt="Coastal conservation — authenticator setup">
      <Suspense fallback={null}>
        <TotpEnrollView />
      </Suspense>
    </AuthLoginShell>
  );
}
