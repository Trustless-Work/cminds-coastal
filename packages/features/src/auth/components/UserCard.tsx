"use client";

import { formatAddress, useCopy } from "@repo/helpers";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

type UserCardProps = {
  displayName: string | null;
  avatarUrl: string | null;
  /** Secondary line under the name (e.g. role). */
  subtitle?: string | null;
  walletAddress?: string | null;
  /** When set, the card navigates here on click (e.g. profile). */
  href?: string;
  className?: string;
};

const NAME_MAX_CHARS = 18;

function initialsFromName(displayName: string | null): string {
  if (!displayName?.trim()) {
    return "?";
  }
  const parts = displayName.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

/** Soft truncate for long names — prefer first + last initial before hard cut. */
function shortenDisplayName(name: string, maxChars = NAME_MAX_CHARS): string {
  const trimmed = name.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0] ?? "";
    const lastInitial = parts[parts.length - 1]?.[0]?.toUpperCase() ?? "";
    const condensed = `${first} ${lastInitial}.`;
    if (condensed.length <= maxChars) {
      return condensed;
    }
  }

  return `${trimmed.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

export function UserCard({
  displayName,
  avatarUrl,
  subtitle,
  walletAddress,
  href,
  className,
}: UserCardProps) {
  const router = useRouter();
  const { copiedKeyId, copyToClipboard } = useCopy();
  const fullName = displayName?.trim() || "User";
  const label = shortenDisplayName(fullName);
  const nameIsShortened = label !== fullName;
  const address = walletAddress?.trim() || null;
  const secondary = subtitle?.trim() || null;
  const formattedWallet = address ? formatAddress(address, 6) : null;
  const isLink = Boolean(href);

  function navigateToHref(): void {
    if (!href) {
      return;
    }
    router.push(href);
  }

  function handleCardClick(event: MouseEvent<HTMLDivElement>): void {
    if (!href) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-user-card-action]")) {
      return;
    }
    navigateToHref();
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!href) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToHref();
    }
  }

  return (
    <TooltipProvider delay={200}>
      <div
        className={cn(
          "flex h-11 min-w-0 flex-1 items-center rounded-full bg-white py-0 pl-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/80 md:max-w-[17rem] md:flex-initial",
          address ? "pr-1.5" : "pr-3",
          isLink && "cursor-pointer",
          className,
        )}
        role={isLink ? "link" : undefined}
        tabIndex={isLink ? 0 : undefined}
        aria-label={isLink ? `Open profile for ${fullName}` : undefined}
        onClick={isLink ? handleCardClick : undefined}
        onKeyDown={isLink ? handleCardKeyDown : undefined}
      >
        <Avatar size="sm" className="size-8 shrink-0 after:border-transparent">
          {avatarUrl ? (
            <AvatarImage
              src={avatarUrl}
              alt={fullName}
              referrerPolicy="no-referrer"
            />
          ) : null}
          <AvatarFallback className="bg-[#EDE8F5] text-[11px] font-semibold text-foreground">
            {initialsFromName(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="ml-2.5 min-w-0 flex-1 overflow-hidden leading-none">
          {nameIsShortened ? (
            <Tooltip>
              <TooltipTrigger
                className="block w-full max-w-full truncate text-left text-xs font-bold tracking-tight text-foreground outline-none"
                render={<button type="button" />}
              >
                {label}
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[16rem]">
                {fullName}
              </TooltipContent>
            </Tooltip>
          ) : (
            <p className="truncate text-xs font-bold tracking-tight text-foreground">
              {label}
            </p>
          )}
          {secondary ? (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {secondary}
            </p>
          ) : null}
        </div>

        {address && formattedWallet ? (
          <div className="ml-3 flex shrink-0 items-center border-l border-border/80 pl-2.5 sm:ml-4 sm:pl-3">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    data-user-card-action
                    className="size-7 shrink-0 rounded-full text-muted-foreground hover:scale-100 hover:bg-background-tertiary hover:text-foreground"
                    aria-label={
                      copiedKeyId ? "Address copied" : "Copy wallet address"
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      void copyToClipboard(address);
                    }}
                  />
                }
              >
                {copiedKeyId ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" strokeWidth={2} />
                )}
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="font-mono tracking-wide"
              >
                {formattedWallet}
              </TooltipContent>
            </Tooltip>
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
