"use client";

import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/utils";

const brandLinkClassName =
  "font-medium text-sky-800 underline underline-offset-4 decoration-sky-800/40 transition-colors hover:text-sky-950 hover:decoration-sky-950";

type BrandTextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function BrandTextLink({
  href,
  children,
  className,
}: BrandTextLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(brandLinkClassName, className)}
    >
      {children}
    </a>
  );
}

export function StellarLink({ className }: { className?: string }) {
  return (
    <BrandTextLink href="https://stellar.org" className={className}>
      Stellar
    </BrandTextLink>
  );
}

export function TrustlessWorkLink({ className }: { className?: string }) {
  return (
    <BrandTextLink href="https://www.trustlesswork.com" className={className}>
      Trustless Work
    </BrandTextLink>
  );
}
