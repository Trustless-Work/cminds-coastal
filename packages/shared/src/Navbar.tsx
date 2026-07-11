"use client";

import { ModeToggle } from "@repo/ui/components/mode-toggle";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

type NavbarProps = {
  title?: string;
  subtitle?: string;
  leading?: ReactNode;
  className?: string;
};

export function Navbar({ title, subtitle, leading, className }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {title ? (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                {title}
              </span>
              {subtitle ? (
                <span className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {leading}
          {leading ? (
            <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
          ) : null}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
