"use client";

import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

import { AdminLogoutButton } from "@/features/auth/components/AdminLogoutButton";

import { AdminSidebar } from "./AdminSidebar";

type AdminShellProps = {
  children: ReactNode;
  email?: string | null;
  logoSrc?: string;
  logoHref?: string;
  className?: string;
};

export const AdminShell = ({
  children,
  email,
  logoSrc = "/logos/dark-en-logo.png",
  logoHref = "/dashboard",
  className,
}: AdminShellProps) => {
  return (
    <div className={cn("flex min-h-svh flex-col bg-background", className)}>
      <header className="relative z-50 w-full border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 md:px-10">
          <Link href={logoHref} className="inline-flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="CMinds"
              className="h-8 w-auto object-contain sm:h-10"
            />
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            {email ? (
              <span className="hidden truncate text-sm text-muted-foreground sm:inline">
                {email}
              </span>
            ) : null}
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 md:flex-row md:items-stretch md:gap-8 md:px-10">
        <AdminSidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
};
