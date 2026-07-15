"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/password.schema";
import { getSupabaseBrowserClient } from "../services/supabase-browser";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues): Promise<void> {
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        values.email,
        { redirectTo },
      );

      if (resetError) {
        toastError(
          "Reset Email Failed",
          resetError.message ||
            "Unable to send a reset email. Please try again.",
        );
        return;
      }

      setSent(true);
      toastSuccess(
        "Reset Email Sent",
        "If an account exists for that email, check your inbox for the recovery link.",
      );
    } catch (err) {
      toastError(
        "Reset Email Failed",
        err instanceof Error
          ? err.message
          : "Unable to send a reset email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return { form, onSubmit, loading, sent };
}
