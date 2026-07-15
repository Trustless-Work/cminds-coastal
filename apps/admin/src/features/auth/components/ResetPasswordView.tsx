"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldGroup } from "@repo/ui/components/field";
import { Form } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";

import { useResetPassword } from "../hooks/useResetPassword";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { OtpCodeField } from "./OtpCodeField";

export function ResetPasswordView({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { status } = useSupabaseAuth();
  const {
    step,
    hasSession,
    otpForm,
    passwordForm,
    onVerifyTotp,
    onUpdatePassword,
    loading,
  } = useResetPassword();

  if (status === "loading" || step === "loading") {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <div className="flex flex-col gap-3">
          <Skeleton className="mx-auto h-7 w-48" />
          <Skeleton className="mx-auto h-4 w-64 max-w-full" />
          <Skeleton className="mt-2 h-12 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Invalid or expired link
          </h1>
          <p className="text-sm text-muted-foreground">
            Request a new password reset email and open the latest link.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Request reset link
          </Link>
        </div>
      </div>
    );
  }

  if (step === "mfa") {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h1 className="text-xl font-semibold tracking-tight">
              Confirm authenticator
            </h1>
            <p className="text-balance text-sm text-muted-foreground">
              Enter your 6-digit TOTP code before setting a new password.
            </p>
          </div>

          <Form {...otpForm}>
            <form
              className="flex flex-col gap-4"
              onSubmit={otpForm.handleSubmit(onVerifyTotp)}
              noValidate
            >
              <OtpCodeField
                control={otpForm.control}
                name="code"
                label="Authenticator Code"
                disabled={loading}
                autoFocus
                onComplete={() => {
                  if (!loading) {
                    void otpForm.handleSubmit(onVerifyTotp)();
                  }
                }}
              />
              <FieldGroup>
                <Field>
                  <Button
                    className="h-12 w-full"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Verifying…" : "Continue"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-sm", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Choose a new password
          </h1>
          <p className="text-balance text-sm text-muted-foreground">
            After saving, you will sign in again with email, password, and TOTP.
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={passwordForm.handleSubmit(onUpdatePassword)}
          noValidate
        >
          <FieldGroup>
            <Field>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                disabled={loading}
                {...passwordForm.register("password")}
              />
              {passwordForm.formState.errors.password ? (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.password.message}
                </p>
              ) : null}
            </Field>
            <Field>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                disabled={loading}
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword ? (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </Field>
            <Field>
              <Button className="h-12 w-full" type="submit" disabled={loading}>
                {loading ? "Saving…" : "Update password"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
