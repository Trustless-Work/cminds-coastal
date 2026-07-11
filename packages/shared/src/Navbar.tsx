"use client";

import { ModeToggle } from "@repo/ui/components/mode-toggle";
import type { ReactNode } from "react";

type NavbarProps = {
  leading?: ReactNode;
};

export function Navbar({ leading }: NavbarProps) {
  return (
    <header className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {leading}
      <ModeToggle />
    </header>
  );
}
