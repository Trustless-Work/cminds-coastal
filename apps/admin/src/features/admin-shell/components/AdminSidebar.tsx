"use client";

import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_ITEMS } from "../constants/nav";

type AdminSidebarProps = {
  className?: string;
};

export const AdminSidebar = ({ className }: AdminSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col gap-8 rounded-2xl border border-border bg-background p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] md:h-[calc(100svh-5rem-4rem)] md:w-60 md:self-start lg:w-64",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="font-bold text-2xl tracking-tight text-foreground">
          Admin
        </p>
      </div>

      <nav
        className="flex flex-row gap-2 md:flex-1 md:flex-col md:gap-1"
        aria-label="Admin"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-background-secondary hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
