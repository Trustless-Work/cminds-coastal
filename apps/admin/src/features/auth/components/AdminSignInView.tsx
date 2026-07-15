"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldGroup } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { useEffect } from "react";

import { useAdminSignIn } from "../hooks/useAdminSignIn";
import { usePostPasswordRoute } from "../hooks/usePostPasswordRoute";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { isSupabaseConfigured } from "../services/supabase-browser";

export function AdminSignInView({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const configured = isSupabaseConfigured();
  const { status, session, aal, hasVerifiedTotp } = useSupabaseAuth();
  const routeAfterPassword = usePostPasswordRoute();
  const { form, onSubmit, loading } = useAdminSignIn();
  const userId = session?.user.id;

  // Resume MFA / dashboard when a session already exists (cold load on /login).
  // Do not depend on the whole session object — token refresh would re-fire this.
  useEffect(() => {
    if (status !== "ready" || !userId) {
      return;
    }
    void routeAfterPassword();
  }, [status, userId, routeAfterPassword]);

  if (!configured) {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Admin auth unavailable
          </h1>
          <p className="text-sm text-muted-foreground">
            Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
        </div>
      </div>
    );
  }

  if (status !== "ready" || (session && aal !== "aal2")) {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <div className="flex flex-col gap-3">
          <Skeleton className="mx-auto h-7 w-40" />
          <Skeleton className="mx-auto h-4 w-56 max-w-full" />
          <Skeleton className="mt-2 h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (session && aal === "aal2" && hasVerifiedTotp) {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <div className="flex flex-col gap-3">
          <Skeleton className="mx-auto h-7 w-40" />
          <Skeleton className="mx-auto h-4 w-56 max-w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-sm", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Admin sign in
          </h1>
          <p className="text-balance text-sm text-muted-foreground">
            Email and password, then authenticator code (TOTP).
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup>
            <Field>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                disabled={loading}
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={loading}
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </Field>
            <Field>
              <Button className="h-12 w-full" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Continue"}
              </Button>
            </Field>
          </FieldGroup>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/forgot-password"
              className="underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
