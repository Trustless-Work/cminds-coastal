"use client";

import { ApiError } from "@repo/config";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AdminShell } from "@/features/admin-shell/components/AdminShell";

import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { fetchAdminMe } from "../services/admin-users.service";
import { isSupabaseConfigured } from "../services/supabase-browser";
type AdminAuthGateProps = {
  children: ReactNode;
  logoSrc?: string;
  logoHref?: string;
};

function AdminShellSkeleton({
  logoSrc,
  logoHref,
}: {
  logoSrc: string;
  logoHref: string;
}) {
  return (
    <AdminShell logoSrc={logoSrc} logoHref={logoHref}>
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="min-h-48 flex-1 rounded-2xl" />
      </div>
    </AdminShell>
  );
}

export function AdminAuthGate({
  children,
  logoSrc = "/logos/dark-en-logo.png",
  logoHref = "/dashboard",
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
      <AdminShell logoSrc={logoSrc} logoHref={logoHref}>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm font-medium">Admin auth unavailable</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Configure NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
        </div>
      </AdminShell>
    );
  }

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
    return <AdminShellSkeleton logoSrc={logoSrc} logoHref={logoHref} />;
  }

  if (profileQuery.error) {
    const message =
      profileQuery.error instanceof ApiError
        ? profileQuery.error.message
        : "Unable to load admin profile";

    return (
      <AdminShell
        email={session?.user.email}
        logoSrc={logoSrc}
        logoHref={logoHref}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm font-medium">Access denied</p>
          <p className="max-w-sm text-sm text-destructive">{message}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ask an operator to create your Supabase Auth user and an active
            row in users with the same email and role ADMIN.
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      email={profileQuery.data?.email}
      logoSrc={logoSrc}
      logoHref={logoHref}
    >
      {children}
    </AdminShell>
  );
}
