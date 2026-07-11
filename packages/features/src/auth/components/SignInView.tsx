"use client";

import { usePollar } from "@pollar/react";
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
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSyncUser } from "../hooks/useSyncUser";
import type { SyncableUserRole } from "../types";

type SignInViewProps = React.ComponentProps<"div"> & {
  appRole: SyncableUserRole;
  dashboardHref?: string;
};

export function SignInView({
  className,
  appRole,
  dashboardHref = "/dashboard",
  ...props
}: SignInViewProps) {
  const router = useRouter();
  const { isAuthenticated, verified, wallet, login, logout } = usePollar();
  const address = wallet?.address ?? "";
  const { isReady, syncing, error } = useSyncUser({
    role: appRole,
    enabled: isAuthenticated && verified && Boolean(address),
  });

  useEffect(() => {
    if (isAuthenticated && verified && isReady) {
      router.replace(dashboardHref);
    }
  }, [dashboardHref, isAuthenticated, isReady, router, verified]);

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
            <Skeleton className="h-4 w-3/4 mx-auto" />
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

  return (
    <div className={cn("w-full max-w-sm", className)} {...props}>
      <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="items-center gap-3 text-center">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Welcome
            </CardTitle>
            <CardDescription className="text-balance">
              Sign in with Google to access your Stellar wallet and continue.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <Button
                className="w-full"
                type="button"
                onClick={() => login({ provider: "google" })}
              >
                <GoogleIcon />
                Continue with Google
              </Button>
            </Field>
          </FieldGroup>
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
