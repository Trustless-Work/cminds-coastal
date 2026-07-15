"use client";

import { Button } from "@repo/ui/components/button";
import { Field, FieldGroup } from "@repo/ui/components/field";
import { Form } from "@repo/ui/components/form";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useTotpChallenge } from "../hooks/useTotpChallenge";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { OtpCodeField } from "./OtpCodeField";

export function TotpChallengeView({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { status, session, aal, hasVerifiedTotp, signOut } = useSupabaseAuth();
  const { form, onSubmit, loading, resolvingFactor } = useTotpChallenge();

  useEffect(() => {
    if (status !== "ready") {
      return;
    }
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!hasVerifiedTotp) {
      router.replace("/mfa/enroll");
      return;
    }
    if (aal === "aal2") {
      router.replace("/dashboard");
    }
  }, [status, session, aal, hasVerifiedTotp, router]);

  const showChallengeSkeleton =
    status !== "ready" ||
    !session ||
    resolvingFactor ||
    !hasVerifiedTotp ||
    aal === "aal2";

  if (showChallengeSkeleton) {
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

  return (
    <div className={cn("w-full max-w-sm", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Authenticator code
          </h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>

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
              disabled={loading}
              autoFocus
              onComplete={() => {
                if (!loading) {
                  void form.handleSubmit(onSubmit)();
                }
              }}
            />
            <FieldGroup>
              <Field>
                <Button className="h-12 w-full" type="submit" disabled={loading}>
                  {loading ? "Verifying…" : "Verify"}
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
