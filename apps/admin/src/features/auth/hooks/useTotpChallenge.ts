"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toastError } from "@repo/ui/lib/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { otpSchema, type OtpFormValues } from "../schemas/otp.schema";
import { getSupabaseBrowserClient } from "../services/supabase-browser";
import { getVerifiedTotpFactor } from "../utils/aal";
import { safeReturnTo } from "../utils/safe-return-to";
import { useSupabaseAuth } from "./useSupabaseAuth";

export function useTotpChallenge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const { refreshAuthState, session } = useSupabaseAuth();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolvingFactor, setResolvingFactor] = useState(true);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    async function loadFactor(): Promise<void> {
      setResolvingFactor(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error: listError } = await supabase.auth.mfa.listFactors();
        if (cancelled) {
          return;
        }
        if (listError) {
          toastError(
            "Authenticator Unavailable",
            listError.message ||
              "Unable to load authenticator factors. Please try again.",
          );
          return;
        }
        const factor = getVerifiedTotpFactor(data?.totp ?? data?.all);
        if (!factor) {
          router.replace(
            `/mfa/enroll?returnTo=${encodeURIComponent(returnTo)}`,
          );
          return;
        }
        setFactorId(factor.id);
      } catch (err) {
        if (!cancelled) {
          toastError(
            "Authenticator Unavailable",
            err instanceof Error
              ? err.message
              : "Unable to load authenticator factors. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setResolvingFactor(false);
        }
      }
    }

    void loadFactor();

    return () => {
      cancelled = true;
    };
  }, [session, router, returnTo]);

  async function onSubmit(values: OtpFormValues): Promise<void> {
    if (!factorId) {
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify(
        {
          factorId,
          code: values.code,
        },
      );

      if (verifyError) {
        toastError(
          "Verification Failed",
          verifyError.message ||
            "Invalid authenticator code. Please try again.",
        );
        return;
      }

      await supabase.auth.refreshSession();
      await refreshAuthState();
      router.replace(returnTo);
    } catch (err) {
      toastError(
        "Verification Failed",
        err instanceof Error
          ? err.message
          : "Invalid authenticator code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return { form, onSubmit, loading, resolvingFactor };
}
