"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { AnimatedThemeToggler } from "@repo/ui/components/animated-theme-toggler";
import { cn } from "@repo/ui/lib/utils";

const toggleClassName =
  "inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted [&_svg]:size-4";

export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn(toggleClassName, className)} aria-hidden />;
  }

  return (
    <AnimatedThemeToggler
      className={cn(toggleClassName, className)}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={setTheme}
    />
  );
}
