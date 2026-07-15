import { Suspense } from "react";

import { AuthLoginShell } from "@/features/auth/components/AuthLoginShell";
import { TotpChallengeView } from "@/features/auth/components/TotpChallengeView";

export default function MfaChallengePage() {
  return (
    <AuthLoginShell imageAlt="Coastal conservation — authenticator challenge">
      <Suspense fallback={null}>
        <TotpChallengeView />
      </Suspense>
    </AuthLoginShell>
  );
}
