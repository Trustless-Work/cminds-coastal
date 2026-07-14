"use client";

import { usePollar } from "@pollar/react";
import { clientEnv } from "@repo/config";
import { DashboardShell } from "@repo/shared/DashboardShell";
import type { NavLink } from "@repo/shared/Navbar";
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
  logoSrc?: string;
  logoHref?: string;
  navLinks?: NavLink[];
  children: React.ReactNode;
  loginHref?: string;
};

export function AuthGate(props: AuthGateProps) {
  if (!clientEnv.pollarApiKey) {
    return (
      <DashboardShell
        title={props.appTitle}
        subtitle={props.appSubtitle}
        logoSrc={props.logoSrc}
        logoHref={props.logoHref}
        navLinks={props.navLinks}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm font-medium text-foreground">
            Wallet auth unavailable
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Set NEXT_PUBLIC_POLLAR_API_KEY to enable sign-in for this app.
          </p>
        </div>
      </DashboardShell>
    );
  }

  return <AuthGateInner {...props} />;
}

function AuthGateInner({
  appRole,
  appTitle,
  appSubtitle,
  logoSrc,
  logoHref,
  navLinks,
  children,
  loginHref = "/login",
}: AuthGateProps) {
  const router = useRouter();
  const { isAuthenticated, verified, wallet } = usePollar();
  const { profile, isReady, syncing, error } = useSyncUser({
    role: appRole,
    enabled: isAuthenticated && verified,
  });

  const hasAppRole = Boolean(profile?.roles.includes(appRole));
  const showAuthLeading = Boolean(isAuthenticated && profile);
  const walletAddress =
    wallet?.address ?? profile?.wallets[0]?.address ?? null;

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
        walletAddress={walletAddress}
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
        logoSrc={logoSrc}
        logoHref={logoHref}
        navLinks={navLinks}
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
        logoSrc={logoSrc}
        logoHref={logoHref}
        navLinks={navLinks}
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
      logoSrc={logoSrc}
      logoHref={logoHref}
      navLinks={navLinks}
      leading={authLeading}
    >
      {children}
    </DashboardShell>
  );
}
