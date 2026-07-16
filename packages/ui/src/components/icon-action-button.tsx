"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";

type IconActionButtonProps = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "outline" | "destructive" | "default" | "secondary" | "ghost";
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
};

export const IconActionButton = ({
  label,
  icon,
  onClick,
  disabled = false,
  loading = false,
  variant = "outline",
  className,
  side = "bottom",
  align = "end",
}: IconActionButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          type="button"
          variant={variant}
          size="icon"
          aria-label={label}
          disabled={isDisabled}
          onClick={onClick}
          className={cn(className)}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
};
