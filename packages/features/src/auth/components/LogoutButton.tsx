"use client";

import { usePollar } from "@pollar/react";
import { clearAuthToken } from "@repo/config";
import { Button } from "@repo/ui/components/button";
import { LogOutIcon } from "lucide-react";
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
      size="icon"
      className="size-10 shrink-0 sm:size-11"
      disabled={loading}
      aria-label={loading ? "Signing out" : "Log out"}
      onClick={() => {
        void handleLogout();
      }}
    >
      <LogOutIcon className="size-4" />
    </Button>
  );
}
