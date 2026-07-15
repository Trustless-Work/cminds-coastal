"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldGroup } from "@repo/ui/components/field";
import { Form } from "@repo/ui/components/form";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useTotpEnroll } from "../hooks/useTotpEnroll";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { OtpCodeField } from "./OtpCodeField";

export function TotpEnrollView({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { status, session, aal, hasVerifiedTotp, signOut } = useSupabaseAuth();
  const { form, onSubmit, loading, enrolling, enroll } = useTotpEnroll();

  useEffect(() => {
    if (status !== "ready") {
      return;
    }
    if (!session) {
      router.replace("/login");
      return;
    }
    if (hasVerifiedTotp && aal === "aal2") {
      router.replace("/dashboard");
      return;
    }
    if (hasVerifiedTotp && aal !== "aal2") {
      router.replace("/mfa/challenge");
    }
  }, [status, session, aal, hasVerifiedTotp, router]);

  const showEnrollSkeleton =
    status !== "ready" ||
    !session ||
    enrolling ||
    (hasVerifiedTotp && aal === "aal2") ||
    (hasVerifiedTotp && aal !== "aal2");

  if (showEnrollSkeleton) {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <div className="flex flex-col gap-3">
          <Skeleton className="mx-auto h-7 w-48" />
          <Skeleton className="mx-auto h-4 w-64 max-w-full" />
          <Skeleton className="mx-auto mt-2 size-40 rounded-xl" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-sm", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Set up authenticator
          </h1>
          <p className="text-balance text-sm text-muted-foreground">
            Scan the QR code with Google Authenticator, 1Password, or Authy,
            then enter the 6-digit code.
          </p>
        </div>

        {enroll ? (
          <div className="flex flex-col items-center gap-3">
            {/* QR is a Supabase data URL — not a static public asset */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enroll.qrCode}
              alt="TOTP QR code"
              className="size-44 rounded-xl bg-white p-2 ring-1 ring-border"
            />
            <p className="break-all text-center font-mono text-xs text-muted-foreground">
              {enroll.secret}
            </p>
          </div>
        ) : null}

        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <OtpCodeField
              control={form.control}
              name="code"
              label="Authenticator Code"
              disabled={loading || !enroll}
              autoFocus
              onComplete={() => {
                if (!loading && enroll) {
                  void form.handleSubmit(onSubmit)();
                }
              }}
            />
            <FieldGroup>
              <Field>
                <Button
                  className="h-12 w-full"
                  type="submit"
                  disabled={loading || !enroll}
                >
                  {loading ? "Verifying…" : "Confirm and continue"}
                </Button>
              </Field>
              <Field>
                <Button
                  className="h-12 w-full"
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => {
                    void signOut().then(() => router.replace("/login"));
                  }}
                >
                  Sign out
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      </div>
    </div>
  );
}
