"use client";

import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

export type NavLink = {
  href: string;
  label: string;
};

type NavbarProps = {
  title?: string;
  subtitle?: string;
  /** When set, renders the brand mark instead of the text title. */
  logoSrc?: string;
  logoHref?: string;
  leading?: ReactNode;
  navLinks?: NavLink[];
  className?: string;
};

export function Navbar({
  title,
  subtitle,
  logoSrc,
  logoHref = "/",
  leading,
  navLinks,
  className,
}: NavbarProps) {
  return (
    <header className={cn("relative z-50 w-full bg-background", className)}>
      <div className="mx-auto flex h-20 max-w-[1320px] items-center gap-6 px-6 sm:h-24 sm:px-10">
        <div className="flex min-w-0 flex-1 items-center">
          {logoSrc ? (
            <a href={logoHref} className="inline-flex shrink-0 items-center">
              <img
                src={logoSrc}
                alt={title ?? "CMinds"}
                className="h-8 w-auto object-contain sm:h-10"
              />
            </a>
          ) : title ? (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {title}
              </span>
              {subtitle ? (
                <span className="truncate text-xs text-muted-foreground sm:text-sm">
                  {subtitle}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {navLinks && navLinks.length > 0 ? (
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="text-sm font-medium text-foreground transition-opacity hover:opacity-60"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : (
          <div className="hidden flex-1 md:block" aria-hidden />
        )}

        <div className="flex flex-1 items-center justify-end gap-3">{leading}</div>
      </div>
    </header>
  );
}
