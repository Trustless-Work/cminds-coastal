"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/password.schema";
import { otpSchema, type OtpFormValues } from "../schemas/otp.schema";
import { getSupabaseBrowserClient } from "../services/supabase-browser";
import { getVerifiedTotpFactor, parseAal } from "../utils/aal";
import { useSupabaseAuth } from "./useSupabaseAuth";

type ResetStep = "loading" | "mfa" | "password" | "done";

export function useResetPassword() {
  const router = useRouter();
  const { session, refreshAuthState, signOut } = useSupabaseAuth();
  const [step, setStep] = useState<ResetStep>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const passwordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    let cancelled = false;

    async function resolveStep(): Promise<void> {
      if (!session) {
        if (!cancelled) {
          setStep("loading");
        }
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const [{ data: aalData }, { data: factorsData }] = await Promise.all([
          supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
          supabase.auth.mfa.listFactors(),
        ]);

        if (cancelled) {
          return;
        }

        const factor = getVerifiedTotpFactor(
          factorsData?.totp ?? factorsData?.all,
        );
        const aal = parseAal(aalData?.currentLevel);

        if (factor && aal !== "aal2") {
          setFactorId(factor.id);
          setStep("mfa");
          return;
        }

        setStep("password");
      } catch (err) {
        if (!cancelled) {
          toastError(
            "Password Reset Interrupted",
            err instanceof Error
              ? err.message
              : "Unable to continue password reset. Please request a new link.",
          );
          setStep("password");
        }
      }
    }

    void resolveStep();

    return () => {
      cancelled = true;
    };
  }, [session]);

  async function onVerifyTotp(values: OtpFormValues): Promise<void> {
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
      setStep("password");
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

  async function onUpdatePassword(
    values: ResetPasswordFormValues,
  ): Promise<void> {
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) {
        toastError(
          "Password Update Failed",
          updateError.message || "Unable to update password. Please try again.",
        );
        return;
      }

      await signOut();
      setStep("done");
      toastSuccess(
        "Password Updated",
        "Sign in again with your new password and authenticator code.",
      );
      router.replace("/login");
    } catch (err) {
      toastError(
        "Password Update Failed",
        err instanceof Error
          ? err.message
          : "Unable to update password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    step,
    hasSession: Boolean(session),
    otpForm,
    passwordForm,
    onVerifyTotp,
    onUpdatePassword,
    loading,
  };
}
