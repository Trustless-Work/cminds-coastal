"use client";

import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

import { Navbar } from "./Navbar";

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DashboardShell({
  title,
  subtitle,
  leading,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar title={title} subtitle={subtitle} leading={leading} />
      <div className={cn("flex flex-1 flex-col", className)}>{children}</div>
    </div>
  );
}
