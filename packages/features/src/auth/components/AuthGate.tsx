"use client";

import { usePollar } from "@pollar/react";
import { DashboardShell } from "@repo/shared/DashboardShell";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSyncUser } from "../hooks/useSyncUser";
import type { SyncableUserRole } from "../types";
import { LogoutButton } from "./LogoutButton";
import { UserCard } from "./UserCard";

type AuthGateProps = {
  appRole: SyncableUserRole;
  appTitle: string;
  appSubtitle?: string;
  children: React.ReactNode;
  loginHref?: string;
};

export function AuthGate({
  appRole,
  appTitle,
  appSubtitle,
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
      <DashboardShell
        title={appTitle}
        subtitle={appSubtitle}
        leading={authLeading}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <div className="flex w-full max-w-xs flex-col items-center gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {error ? "Session error" : "Checking session…"}
          </p>
        </div>
      </DashboardShell>
    );
  }

  if (!hasAppRole) {
    return (
      <DashboardShell
        title={appTitle}
        subtitle={appSubtitle}
        leading={authLeading}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm font-medium text-foreground">Access denied</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your account does not have permission to use this app.
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={appTitle}
      subtitle={appSubtitle}
      leading={authLeading}
    >
      {children}
    </DashboardShell>
  );
}
