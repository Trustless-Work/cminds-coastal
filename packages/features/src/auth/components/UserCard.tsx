"use client";

import { formatAddress } from "@repo/helpers";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { cn } from "@repo/ui/lib/utils";

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
  const label = displayName?.trim() || "User";
  const address = walletAddress?.trim() || null;

  return (
    <div
      className={cn(
        "flex max-w-[14rem] items-center gap-2 rounded-full border border-border/60 bg-muted/40 py-1 px-5",
        className,
      )}
    >
      <Avatar size="sm">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={label} /> : null}
        <AvatarFallback>{initialsFromName(displayName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex flex-col leading-tight">
        <span className="truncate text-sm font-medium text-foreground">
          {label}
        </span>
        {address ? (
          <span
            className="truncate font-mono text-[11px] text-muted-foreground"
            title={address}
          >
            {formatAddress(address, 4)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
