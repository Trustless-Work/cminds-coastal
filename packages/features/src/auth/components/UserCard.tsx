"use client";

import { formatAddress, useCopy } from "@repo/helpers";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Check, Copy } from "lucide-react";

type UserCardProps = {
  displayName: string | null;
  avatarUrl: string | null;
  walletAddress?: string | null;
  className?: string;
};

function initialsFromName(displayName: string | null): string {
  if (!displayName?.trim()) {
    return "?";
  }
  const parts = displayName.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function UserCard({
  displayName,
  avatarUrl,
  walletAddress,
  className,
}: UserCardProps) {
  const { copiedKeyId, copyToClipboard } = useCopy();
  const label = displayName?.trim() || "User";
  const address = walletAddress?.trim() || null;

  return (
    <div
      className={cn(
        "flex max-w-[16rem] items-center gap-2 rounded-full border border-border/60 bg-muted/40 py-1 pr-2 pl-5",
        className,
      )}
    >
      <Avatar size="sm">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={label} /> : null}
        <AvatarFallback>{initialsFromName(displayName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-foreground">
          {label}
        </span>
        {address ? (
          <div className="flex min-w-0 items-center gap-0.5">
            <span
              className="truncate font-mono text-[11px] text-muted-foreground"
              title={address}
            >
              {formatAddress(address, 4)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={copiedKeyId ? "Address copied" : "Copy wallet address"}
              onClick={() => {
                void copyToClipboard(address);
              }}
            >
              {copiedKeyId ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
