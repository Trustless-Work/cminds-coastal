"use client";

import { usePollar } from "@pollar/react";
import { formatAddress } from "@repo/helpers";
import { Navbar } from "@repo/shared/Navbar";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@repo/ui/components/field";
import { cn } from "@repo/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSyncUser } from "../hooks/useSyncUser";
import type { SyncableUserRole } from "../types";
import { LogoutButton } from "./LogoutButton";
import { UserCard } from "./UserCard";

type SignInViewProps = React.ComponentProps<"div"> & {
  appRole: SyncableUserRole;
  dashboardHref?: string;
  loginHref?: string;
};

export function SignInView({
  className,
  appRole,
  dashboardHref = "/dashboard",
  loginHref = "/login",
  ...props
}: SignInViewProps) {
  const router = useRouter();
  const { isAuthenticated, verified, wallet, login, logout } = usePollar();
  const address = wallet?.address ?? "";
  const { profile, isReady, syncing, error } = useSyncUser({
    role: appRole,
    enabled: isAuthenticated && verified && Boolean(address),
  });

  const authLeading = profile ? (
    <>
      <UserCard
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
      />
      <LogoutButton loginHref={loginHref} />
    </>
  ) : isAuthenticated ? (
    <LogoutButton loginHref={loginHref} />
  ) : null;

  useEffect(() => {
    if (isAuthenticated && verified && isReady) {
      router.replace(dashboardHref);
    }
  }, [dashboardHref, isAuthenticated, isReady, router, verified]);

  if (isAuthenticated && (!verified || syncing || (!isReady && !error))) {
    return (
      <>
        <Navbar leading={authLeading} />
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="overflow-hidden p-0">
            <CardContent className="flex items-center justify-center p-10">
              <p className="text-sm text-muted-foreground">
                {!verified ? "Verifying session…" : "Syncing your account…"}
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isAuthenticated && address) {
    return (
      <>
        <Navbar leading={authLeading} />
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="flex flex-col justify-center gap-6 p-6 md:p-8">
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Signed in</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                      Connected as {formatAddress(address)}
                    </p>
                    {error ? (
                      <p className="text-sm text-destructive">{error}</p>
                    ) : null}
                  </div>
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
              </div>
              <div className="relative hidden bg-muted md:block">
                <img
                  src="/placeholder.svg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Continue with Google to access your Stellar wallet.
                  </p>
                </div>
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
            </div>
            <div className="relative hidden bg-muted md:block">
              <img
                src="/placeholder.svg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </>
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
