"use client";

import { usePollar } from "@pollar/react";
import { Button } from "@repo/ui/components/button";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { endStalePollarSession } from "../utils/end-stale-session";

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
      await endStalePollarSession(logout);
      router.replace(loginHref);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-11 shrink-0 rounded-full bg-white text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/80 hover:bg-white hover:text-foreground hover:opacity-80"
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
