"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Card } from "@repo/ui/components/card";
import type { ReactNode } from "react";

type ProfileHeaderCardProps = {
  displayName: string | null;
  email?: string | null;
  avatarUrl: string | null;
  secondary?: string | null;
  roles?: string[];
  action?: ReactNode;
};

const ROLE_LABELS: Record<string, string> = {
  COMMUNITY_IMPLEMENTER: "Community Implementer",
  RELEASE_SIGNER: "Release Signer",
  CMINDS_OPERATOR: "CMinds Operator",
  FUNDER: "Funder",
  ADMIN: "Admin",
};

function initials(name: string | null): string {
  if (!name?.trim()) {
    return "?";
  }
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export const ProfileHeaderCard = ({
  displayName,
  email,
  avatarUrl,
  secondary,
  roles,
  action,
}: ProfileHeaderCardProps) => {
  const fullName = displayName?.trim() || "User";

  return (
    <Card className="flex flex-col gap-5 rounded-[24px] border-border/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="size-16 shrink-0">
          {avatarUrl ? (
            <AvatarImage
              src={avatarUrl}
              alt={fullName}
              referrerPolicy="no-referrer"
            />
          ) : null}
          <AvatarFallback className="bg-[#ECECEC] text-lg font-semibold text-foreground">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold tracking-tight text-foreground">
            {fullName}
          </h2>
          {email ? (
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          ) : null}
          {secondary ? (
            <p className="truncate text-sm text-muted-foreground">
              {secondary}
            </p>
          ) : null}
          {roles && roles.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-background-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {ROLE_LABELS[role] ?? role}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </Card>
  );
};
