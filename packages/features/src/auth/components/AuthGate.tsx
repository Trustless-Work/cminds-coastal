"use client";

import { usePollar } from "@pollar/react";
import { Navbar } from "@repo/shared/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSyncUser } from "../hooks/useSyncUser";
import type { SyncableUserRole } from "../types";
import { LogoutButton } from "./LogoutButton";
import { UserCard } from "./UserCard";

type AuthGateProps = {
  appRole: SyncableUserRole;
  children: React.ReactNode;
  loginHref?: string;
};

export function AuthGate({
  appRole,
  children,
  loginHref = "/login",
}: AuthGateProps) {
  const router = useRouter();
  const { isAuthenticated, verified } = usePollar();
  const { profile, isReady, syncing, error } = useSyncUser({
    role: appRole,
    enabled: isAuthenticated && verified,
  });

  const hasAppRole = Boolean(profile?.roles.includes(appRole));
  const showAuthLeading = Boolean(isAuthenticated && profile);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(loginHref);
    }
  }, [isAuthenticated, loginHref, router]);

  const authLeading = showAuthLeading ? (
    <>
      <UserCard
        displayName={profile?.display_name ?? null}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <LogoutButton loginHref={loginHref} />
    </>
  ) : isAuthenticated ? (
    <LogoutButton loginHref={loginHref} />
  ) : null;

  if (!isAuthenticated || !verified || syncing || !isReady) {
    return (
      <>
        <Navbar leading={authLeading} />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            {error ? error : "Checking session…"}
          </p>
        </div>
      </>
    );
  }

  if (!hasAppRole) {
    return (
      <>
        <Navbar leading={authLeading} />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
          <p className="text-sm font-medium text-foreground">Access denied</p>
          <p className="text-sm text-muted-foreground">
            Your account does not have permission to use this app.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar leading={authLeading} />
      {children}
    </>
  );
}
