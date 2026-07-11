"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { cn } from "@repo/ui/lib/utils";

type UserCardProps = {
  displayName: string | null;
  avatarUrl: string | null;
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
  className,
}: UserCardProps) {
  const label = displayName?.trim() || "User";

  return (
    <div
      className={cn(
        "flex max-w-[12rem] items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5",
        className,
      )}
    >
      <Avatar size="sm">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={label} /> : null}
        <AvatarFallback>{initialsFromName(displayName)}</AvatarFallback>
      </Avatar>
      <span className="truncate text-sm font-medium text-foreground">
        {label}
      </span>
    </div>
  );
}
