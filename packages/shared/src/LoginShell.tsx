import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

type LoginShellProps = {
  children: ReactNode;
  className?: string;
};

export function LoginShell({ children, className }: LoginShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--muted),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40"
      />
      <main
        className={cn(
          "relative flex flex-1 items-center justify-center p-6 sm:p-8",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
