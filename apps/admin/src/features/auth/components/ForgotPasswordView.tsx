"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldGroup } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";

import { useForgotPassword } from "../hooks/useForgotPassword";
import { isSupabaseConfigured } from "../services/supabase-browser";

export function ForgotPasswordView({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const configured = isSupabaseConfigured();
  const { form, onSubmit, loading, sent } = useForgotPassword();

  if (!configured) {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <p className="text-center text-sm text-muted-foreground">
          Supabase Auth is not configured.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-sm", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Reset password
          </h1>
          <p className="text-balance text-sm text-muted-foreground">
            We will email a recovery link. If MFA is enabled, you will confirm
            your authenticator code before setting a new password.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, a reset link has been sent.
              Check your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <FieldGroup>
              <Field>
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
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
                <Button className="h-12 w-full" type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </Field>
            </FieldGroup>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="underline-offset-4 hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
