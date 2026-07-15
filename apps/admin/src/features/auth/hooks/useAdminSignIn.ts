"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toastError } from "@repo/ui/lib/toast";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginFormValues } from "../schemas/login.schema";
import { getSupabaseBrowserClient } from "../services/supabase-browser";
import { usePostPasswordRoute } from "./usePostPasswordRoute";
import { useSupabaseAuth } from "./useSupabaseAuth";

export function useAdminSignIn() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const { refreshAuthState } = useSupabaseAuth();
  const routeAfterPassword = usePostPasswordRoute();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues): Promise<void> {
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        toastError(
          "Sign-In Failed",
          signInError.message ||
            "Check your email and password and try again.",
        );
        return;
      }

      await refreshAuthState();
      await routeAfterPassword(returnTo);
    } catch (err) {
      toastError(
        "Sign-In Failed",
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return { form, onSubmit, loading };
}
