"use client";

import { ApiError } from "@repo/config";
import { DashboardShell } from "@repo/shared/DashboardShell";
import type { NavLink } from "@repo/shared/Navbar";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { fetchAdminMe } from "../services/admin-users.service";
import { isSupabaseConfigured } from "../services/supabase-browser";
import { AdminLogoutButton } from "./AdminLogoutButton";

type AdminAuthGateProps = {
  children: ReactNode;
  appTitle?: string;
  appSubtitle?: string;
  logoSrc?: string;
  logoHref?: string;
  navLinks?: NavLink[];
};

function DashboardContentSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 sm:p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export function AdminAuthGate({
  children,
  appTitle = "Admin",
  appSubtitle = "Platform administration",
  logoSrc = "/logos/dark-en-logo.png",
  logoHref = "/dashboard",
  navLinks = [],
}: AdminAuthGateProps) {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const { status, session, aal, hasVerifiedTotp, accessToken, signOut } =
    useSupabaseAuth();

  const profileQuery = useQuery({
    queryKey: ["admin-me", accessToken],
    queryFn: fetchAdminMe,
    enabled:
      configured &&
      status === "ready" &&
      Boolean(session) &&
      aal === "aal2" &&
      hasVerifiedTotp,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!configured || status !== "ready") {
      return;
    }

    if (!session) {
      router.replace("/login?returnTo=/dashboard");
      return;
    }

    if (!hasVerifiedTotp) {
      router.replace("/mfa/enroll?returnTo=/dashboard");
      return;
    }

    if (aal !== "aal2") {
      router.replace("/mfa/challenge?returnTo=/dashboard");
    }
  }, [configured, status, session, aal, hasVerifiedTotp, router]);

  useEffect(() => {
    if (!profileQuery.error) {
      return;
    }
    if (
      profileQuery.error instanceof ApiError &&
      profileQuery.error.status === 401
    ) {
      void signOut().then(() => router.replace("/login"));
    }
  }, [profileQuery.error, router, signOut]);

  if (!configured) {
    return (
      <DashboardShell
        title={appTitle}
        subtitle={appSubtitle}
        logoSrc={logoSrc}
        logoHref={logoHref}
        navLinks={navLinks}
        showFooter={false}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm font-medium">Admin auth unavailable</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Configure NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
        </div>
      </DashboardShell>
    );
  }

  // Stay on the dashboard shell while hydrating or waiting for profile.
  // Never flash login / MFA chrome from this route.
  const waitingForAuth = status === "loading";
  const waitingForRedirect =
    status === "ready" &&
    (!session || !hasVerifiedTotp || aal !== "aal2");
  const waitingForProfile =
    status === "ready" &&
    Boolean(session) &&
    aal === "aal2" &&
    hasVerifiedTotp &&
    profileQuery.isPending;

  if (waitingForAuth || waitingForRedirect || waitingForProfile) {
    return (
      <DashboardShell
        title={appTitle}
        subtitle={appSubtitle}
        logoSrc={logoSrc}
        logoHref={logoHref}
        navLinks={navLinks}
        showFooter={false}
      >
        <DashboardContentSkeleton />
      </DashboardShell>
    );
  }

  if (profileQuery.error) {
    const message =
      profileQuery.error instanceof ApiError
        ? profileQuery.error.message
        : "Unable to load admin profile";

    return (
      <DashboardShell
        title={appTitle}
        subtitle={appSubtitle}
        logoSrc={logoSrc}
        logoHref={logoHref}
        navLinks={navLinks}
        leading={<AdminLogoutButton />}
        showFooter={false}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-sm font-medium">Access denied</p>
          <p className="max-w-sm text-sm text-destructive">{message}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ask an operator to create your Supabase Auth user and an active
            row in users with the same email and role ADMIN.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const profile = profileQuery.data;

  return (
    <DashboardShell
      title={appTitle}
      subtitle={appSubtitle}
      logoSrc={logoSrc}
      logoHref={logoHref}
      navLinks={navLinks}
      showFooter={false}
      leading={
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {profile?.email}
          </span>
          <AdminLogoutButton />
        </div>
      }
    >
      {children}
    </DashboardShell>
  );
}
