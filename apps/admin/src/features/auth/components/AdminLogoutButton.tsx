"use client";

import { Button } from "@repo/ui/components/button";
import { useRouter } from "next/navigation";

import { useSupabaseAuth } from "../hooks/useSupabaseAuth";

export function AdminLogoutButton() {
  const router = useRouter();
  const { signOut } = useSupabaseAuth();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void signOut().then(() => router.replace("/login"));
      }}
    >
      Sign out
    </Button>
  );
}
