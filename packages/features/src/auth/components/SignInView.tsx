"use client";

import type { AuthState } from "@pollar/core";
import { usePollar } from "@pollar/react";
import { clientEnv } from "@repo/config";
import { formatAddress } from "@repo/helpers";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldGroup } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSyncUser } from "../hooks/useSyncUser";
import {
  fetchAllowedEmailDomains,
  isEmailDomainInAllowlist,
} from "../services/allowed-email-domains.service";
import type { SyncableUserRole } from "../types";

export type AuthProviderOption = "google" | "email";

type SignInViewProps = React.ComponentProps<"div"> & {
  appRole: SyncableUserRole;
  dashboardHref?: string;
  providers: AuthProviderOption[];
  /** CMinds only: allowlist — reject any email whose domain is not allowed */
  enforceAllowedEmailDomain?: boolean;
};

type PollarAuthClient = {
  getAuthState: () => AuthState;
  onAuthStateChange: (cb: (state: AuthState) => void) => () => void;
  verifyEmailCode: (code: string) => void;
  cancelLogin: () => void;
};

export function SignInView({
  className,
  appRole,
  dashboardHref = "/dashboard",
  providers,
  enforceAllowedEmailDomain = false,
  ...props
}: SignInViewProps) {
  if (!clientEnv.pollarApiKey) {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Wallet auth unavailable
            </CardTitle>
            <CardDescription>
              Set NEXT_PUBLIC_POLLAR_API_KEY to enable sign-in for this app.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <SignInViewInner
      className={className}
      appRole={appRole}
      dashboardHref={dashboardHref}
      providers={providers}
      enforceAllowedEmailDomain={enforceAllowedEmailDomain}
      {...props}
    />
  );
}

function SignInViewInner({
  className,
  appRole,
  dashboardHref = "/dashboard",
  providers,
  enforceAllowedEmailDomain = false,
  ...props
}: SignInViewProps) {
  const router = useRouter();
  const { isAuthenticated, verified, wallet, login, logout, getClient } =
    usePollar();
  const address = wallet?.address ?? "";
  const { isReady, syncing, error } = useSyncUser({
    role: appRole,
    enabled: isAuthenticated && verified && Boolean(address),
  });

  const showGoogle = providers.includes("google");
  const showEmail = providers.includes("email");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [authState, setAuthState] = useState<AuthState>({ step: "idle" });
  const [localError, setLocalError] = useState<string | null>(null);
  const [allowedDomains, setAllowedDomains] = useState<string[] | null>(null);
  const [loadingDomains, setLoadingDomains] = useState(
    enforceAllowedEmailDomain,
  );

  useEffect(() => {
    if (isAuthenticated && verified && isReady) {
      router.replace(dashboardHref);
    }
  }, [dashboardHref, isAuthenticated, isReady, router, verified]);

  useEffect(() => {
    const client = getClient() as PollarAuthClient;
    setAuthState(client.getAuthState());
    return client.onAuthStateChange(setAuthState);
  }, [getClient]);

  useEffect(() => {
    if (!enforceAllowedEmailDomain) {
      return;
    }

    let cancelled = false;
    setLoadingDomains(true);

    void fetchAllowedEmailDomains()
      .then((domains) => {
        if (!cancelled) {
          setAllowedDomains(domains);
          setLocalError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllowedDomains(null);
          setLocalError("Could not load allowed email domains");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingDomains(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enforceAllowedEmailDomain]);

  useEffect(() => {
    if (authState.step === "error") {
      setLocalError(authState.message);
    }
  }, [authState]);

  const awaitingCode =
    authState.step === "entering_code" ||
    authState.step === "verifying_email_code" ||
    (authState.step === "error" &&
      (authState.previousStep === "entering_code" ||
        authState.previousStep === "verifying_email_code"));

  const emailBusy =
    authState.step === "sending_email" ||
    authState.step === "verifying_email_code" ||
    authState.step === "creating_session" ||
    authState.step === "authenticating";

  function validateAllowlist(candidate: string): boolean {
    if (!enforceAllowedEmailDomain) {
      return true;
    }
    if (!allowedDomains) {
      setLocalError("Allowed email domains are not available yet");
      return false;
    }
    if (!isEmailDomainInAllowlist(candidate, allowedDomains)) {
      setLocalError("You cannot access to this application.");
      return false;
    }
    return true;
  }

  function handleSendEmailCode(): void {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setLocalError("Enter a valid email address");
      return;
    }
    if (!validateAllowlist(trimmed)) {
      return;
    }
    setLocalError(null);
    setOtpCode("");
    login({ provider: "email", email: trimmed });
  }

  function handleVerifyCode(): void {
    const code = otpCode.trim();
    if (!code) {
      setLocalError("Enter the verification code");
      return;
    }
    setLocalError(null);
    const client = getClient() as PollarAuthClient;
    client.verifyEmailCode(code);
  }

  function handleBackFromCode(): void {
    const client = getClient() as PollarAuthClient;
    client.cancelLogin();
    setOtpCode("");
    setLocalError(null);
  }

  if (isAuthenticated && (!verified || syncing || (!isReady && !error))) {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-xl font-semibold tracking-tight">
              One moment
            </CardTitle>
            <CardDescription>
              {!verified ? "Verifying your session…" : "Syncing your account…"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="mx-auto h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthenticated && address) {
    return (
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Signed in
            </CardTitle>
            <CardDescription>
              Connected as{" "}
              <span className="font-mono text-foreground">
                {formatAddress(address)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="mb-4 text-center text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <FieldGroup>
              <Field>
                <Button
                  className="w-full"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    void logout();
                  }}
                >
                  Sign out
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    );
  }

  const description =
    showEmail && showGoogle
      ? "Sign in with Google or email to access your Stellar wallet and continue."
      : showEmail
        ? "Sign in with your organization email to access your Stellar wallet and continue."
        : "Sign in with Google to access your Stellar wallet and continue.";

  return (
    <div className={cn("w-full max-w-sm", className)} {...props}>
      <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="items-center gap-3 text-center">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Welcome
            </CardTitle>
            <CardDescription className="text-balance">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {localError ? (
            <p className="text-center text-sm text-destructive">{localError}</p>
          ) : null}
          {error ? (
            <p className="text-center text-sm text-destructive">{error}</p>
          ) : null}

          {showGoogle && !awaitingCode ? (
            <FieldGroup>
              <Field>
                <Button
                  className="w-full"
                  type="button"
                  variant={showEmail ? "outline" : "default"}
                  disabled={emailBusy}
                  onClick={() => {
                    setLocalError(null);
                    login({ provider: "google" });
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
              </Field>
            </FieldGroup>
          ) : null}

          {showGoogle && showEmail && !awaitingCode ? (
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-2 text-xs text-muted-foreground">
                or
              </span>
            </div>
          ) : null}

          {showEmail ? (
            awaitingCode ? (
              <FieldGroup>
                <Field>
                  <Label htmlFor="otp-code">Verification code</Label>
                  <Input
                    id="otp-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter code"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    disabled={emailBusy}
                  />
                  <p className="text-xs text-muted-foreground">
                    Sent to {"email" in authState ? authState.email : email}.
                    Check your spam folder if you don&apos;t see it.
                  </p>
                </Field>
                <Field>
                  <Button
                    className="w-full"
                    type="button"
                    disabled={emailBusy || !otpCode.trim()}
                    onClick={handleVerifyCode}
                  >
                    {authState.step === "verifying_email_code"
                      ? "Verifying…"
                      : "Verify code"}
                  </Button>
                </Field>
                <Field>
                  <Button
                    className="w-full"
                    type="button"
                    variant="ghost"
                    disabled={emailBusy}
                    onClick={handleBackFromCode}
                  >
                    Use a different email
                  </Button>
                </Field>
              </FieldGroup>
            ) : (
              <FieldGroup>
                <Field>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={emailBusy || loadingDomains}
                  />
                </Field>
                <Field>
                  <Button
                    className="w-full"
                    type="button"
                    disabled={
                      emailBusy ||
                      loadingDomains ||
                      !email.trim() ||
                      (enforceAllowedEmailDomain && !allowedDomains)
                    }
                    onClick={handleSendEmailCode}
                  >
                    {authState.step === "sending_email"
                      ? "Sending code…"
                      : "Continue with email"}
                  </Button>
                </Field>
              </FieldGroup>
            )
          ) : null}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  );
}
