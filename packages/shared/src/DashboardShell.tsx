"use client";

import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

import { Navbar, type NavLink } from "./Navbar";

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  logoSrc?: string;
  logoHref?: string;
  leading?: ReactNode;
  navLinks?: NavLink[];
  children: ReactNode;
  className?: string;
};

export function DashboardShell({
  title,
  subtitle,
  logoSrc,
  logoHref,
  leading,
  navLinks,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar
        title={title}
        subtitle={subtitle}
        logoSrc={logoSrc}
        logoHref={logoHref}
        leading={leading}
        navLinks={navLinks}
      />
      <div className={cn("flex flex-1 flex-col", className)}>{children}</div>
    </div>
  );
}
