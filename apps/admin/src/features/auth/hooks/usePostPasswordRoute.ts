"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { getSupabaseBrowserClient } from "../services/supabase-browser";
import { getVerifiedTotpFactor, parseAal } from "../utils/aal";
import { safeReturnTo } from "../utils/safe-return-to";

export function usePostPasswordRoute() {
  const router = useRouter();

  return useCallback(
    async (returnTo?: string | null) => {
      const supabase = getSupabaseBrowserClient();
      const [{ data: aalData }, { data: factorsData }] = await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);

      const aal = parseAal(aalData?.currentLevel);
      const hasTotp = Boolean(
        getVerifiedTotpFactor(factorsData?.totp ?? factorsData?.all),
      );
      const destination = safeReturnTo(returnTo);

      if (!hasTotp) {
        router.replace(
          `/mfa/enroll?returnTo=${encodeURIComponent(destination)}`,
        );
        return;
      }

      if (aal !== "aal2") {
        router.replace(
          `/mfa/challenge?returnTo=${encodeURIComponent(destination)}`,
        );
        return;
      }

      router.replace(destination);
    },
    [router],
  );
}
