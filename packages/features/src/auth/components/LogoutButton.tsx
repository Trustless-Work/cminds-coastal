"use client";

import { usePollar } from "@pollar/react";
import { clearAuthToken } from "@repo/config";
import { Button } from "@repo/ui/components/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearCachedUserProfiles } from "../utils/profile-cache";

type LogoutButtonProps = {
  loginHref?: string;
};

export function LogoutButton({ loginHref = "/login" }: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = usePollar();
  const [loading, setLoading] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoading(true);
    try {
      clearAuthToken();
      clearCachedUserProfiles();
      await logout();
      router.replace(loginHref);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="default"
      className="h-11 shrink-0"
      disabled={loading}
      onClick={() => {
        void handleLogout();
      }}
    >
      {loading ? "Signing out…" : "Log out"}
    </Button>
  );
}
