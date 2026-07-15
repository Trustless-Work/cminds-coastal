import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";

type LoginShellProps = {
  children: ReactNode;
  className?: string;
  /** Photo panel for the split auth layout. */
  imageSrc?: string;
  imageAlt?: string;
  logoSrc?: string;
  logoAlt?: string;
};

export function LoginShell({
  children,
  className,
  imageSrc,
  imageAlt = "Coastal conservation",
  logoSrc,
  logoAlt = "CMinds",
}: LoginShellProps) {
  if (!imageSrc) {
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
        <SiteFooter logoSrc={logoSrc} logoAlt={logoAlt} />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#F8F8F8]">
      <div
        className={cn(
          "flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8",
          className,
        )}
      >
        <div className="flex w-full max-w-[1120px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/60 lg:min-h-[560px] lg:flex-row">
          <main className="relative flex w-full flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:w-1/2 lg:px-12 lg:py-14">
            <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="h-9 w-auto object-contain sm:h-10"
                />
              ) : null}
              <div className="w-full">{children}</div>
            </div>
          </main>

          <div
            aria-hidden
            className="mx-6 hidden h-px shrink-0 bg-border lg:mx-0 lg:block lg:h-auto lg:w-px lg:self-stretch"
          />

          <div className="relative min-h-52 w-full p-4 sm:min-h-64 sm:p-5 lg:w-1/2 lg:min-h-0 lg:p-5">
            <div className="relative h-full min-h-52 overflow-hidden rounded-[24px] sm:min-h-64 lg:min-h-full lg:rounded-[28px]">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="absolute inset-0 size-full object-cover object-center"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5"
              />
            </div>
          </div>
        </div>
      </div>
      <SiteFooter logoSrc={logoSrc} logoAlt={logoAlt} />
    </div>
  );
}
