"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

type DuotoneIconProps = {
  icon: LucideIcon;
  className?: string;
  sizeClassName?: string;
};

/** Large Lucide mark with soft fill + crisp stroke (duotone-style). */
export const DuotoneIcon = ({
  icon: Icon,
  className,
  sizeClassName = "size-16",
}: DuotoneIconProps) => {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 text-foreground",
        sizeClassName,
        className,
      )}
      aria-hidden
    >
      <Icon
        className={cn("absolute inset-0 fill-current text-foreground/15", sizeClassName)}
        strokeWidth={0}
      />
      <Icon
        className={cn("relative text-foreground", sizeClassName)}
        strokeWidth={1.5}
      />
    </span>
  );
};
