"use client";

import { usePollar } from "@pollar/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSyncUser } from "../hooks/useSyncUser";
import type { SyncableUserRole } from "../types";
import { LogoutButton } from "./LogoutButton";

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
  const { isReady, syncing, error } = useSyncUser({
    role: appRole,
    enabled: isAuthenticated && verified,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(loginHref);
    }
  }, [isAuthenticated, loginHref, router]);

  if (!isAuthenticated || !verified || syncing || !isReady) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          {error ? error : "Checking session…"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-16 z-50">
        <LogoutButton loginHref={loginHref} />
      </div>
      {children}
    </>
  );
}
