"use client";

import { usePollar } from "@pollar/react";
import { clientEnv } from "@repo/config";
import { DashboardShell } from "@repo/shared/DashboardShell";
import type { NavLink } from "@repo/shared/Navbar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { usePollarBootstrap } from "../hooks/usePollarBootstrap";
import { useSyncUser } from "../hooks/useSyncUser";
import type { SyncableUserRole } from "../types";
import { endStalePollarSession } from "../utils/end-stale-session";
import { LocaleSwitcher } from "@repo/i18n/LocaleSwitcher";

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

function AuthContentSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl sm:col-span-2 lg:col-span-1" />
      </div>
    </div>
  );
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
  const { bootstrapped } = usePollarBootstrap();
  const { isAuthenticated, verified, wallet, logout } = usePollar();
  const { profile, pollarAvatar, isReady, syncing, error } = useSyncUser({
    role: appRole,
    enabled: bootstrapped && isAuthenticated && verified,
  });
  const endingBrokenSession = useRef(false);

  const hasAppRole = Boolean(profile?.roles.includes(appRole));
  const showAuthLeading = Boolean(isAuthenticated && profile);
  const walletAddress =
    wallet?.address ?? profile?.wallets[0]?.address ?? null;
  const avatarUrl = profile?.avatar_url ?? pollarAvatar ?? null;
  const sessionPending =
    !bootstrapped ||
    !isAuthenticated ||
    !verified ||
    syncing ||
    !isReady ||
    Boolean(error);

  useEffect(() => {
    if (!bootstrapped) {
      return;
    }
    if (!isAuthenticated) {
      endingBrokenSession.current = false;
      router.replace(loginHref);
    }
  }, [bootstrapped, isAuthenticated, loginHref, router]);

  useEffect(() => {
    if (!error || endingBrokenSession.current) {
      return;
    }
    endingBrokenSession.current = true;
    void endStalePollarSession(logout).then(() => {
      router.replace(loginHref);
    });
  }, [error, loginHref, logout, router]);

  const authLeading = showAuthLeading ? (
    <div className="flex w-full min-w-0 items-center gap-2 md:w-auto md:justify-end md:gap-3">
      <UserCard
        displayName={profile?.display_name ?? null}
        avatarUrl={avatarUrl}
        subtitle={profile?.email ?? null}
        walletAddress={walletAddress}
      />
      <LocaleSwitcher />
      <LogoutButton loginHref={loginHref} />
    </div>
  ) : isAuthenticated ? (
    <div className="flex items-center gap-2 md:gap-3">
      <LocaleSwitcher />
      <LogoutButton loginHref={loginHref} />
    </div>
  ) : (
    <LocaleSwitcher />
  );

  if (sessionPending) {
    return (
      <DashboardShell
        title={appTitle}
        subtitle={appSubtitle}
        logoSrc={logoSrc}
        logoHref={logoHref}
        navLinks={navLinks}
        leading={authLeading}
      >
        <AuthContentSkeleton />
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
