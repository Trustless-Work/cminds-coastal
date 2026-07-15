"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { formatAddress } from "@repo/helpers";
import { useUserEmailSearch } from "@repo/features/auth/hooks/useUserEmailSearch";
import type {
  SearchableUserRole,
  UserSearchResult,
} from "@repo/features/auth/services/users-search.service";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";

type UserEmailComboboxProps = {
  role?: SearchableUserRole;
  label: string;
  value: UserSearchResult | null;
  onChange: (user: UserSearchResult | null) => void;
  placeholder?: string;
};

function StatusMessage({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "destructive";
}) {
  return (
    <div className="flex min-h-36 items-center justify-center px-4 py-6 text-center">
      <p
        className={cn(
          "max-w-[16rem] text-sm leading-relaxed",
          tone === "destructive" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {children}
      </p>
    </div>
  );
}

function initialsFromUser(user: UserSearchResult): string {
  const name = user.display_name?.trim();
  if (name) {
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
  }
  const emailLocal = user.email.split("@")[0]?.trim();
  if (emailLocal) {
    return emailLocal.slice(0, 2).toUpperCase();
  }
  return "?";
}

function UserOptionAvatar({ user }: { user: UserSearchResult }) {
  const label = user.display_name?.trim() || user.email;
  return (
    <Avatar size="sm" className="size-8 shrink-0 after:border-transparent">
      {user.avatar_url ? (
        <AvatarImage
          src={user.avatar_url}
          alt={label}
          referrerPolicy="no-referrer"
        />
      ) : null}
      <AvatarFallback className="bg-[#EDE8F5] text-[11px] font-semibold text-foreground">
        {initialsFromUser(user)}
      </AvatarFallback>
    </Avatar>
  );
}

function UserOptionMeta({ user }: { user: UserSearchResult }) {
  const wallet = formatAddress(user.wallet_address, 4);
  return (
    <span className="min-w-0 flex-1">
      <span className="block truncate font-medium">{user.email}</span>
      <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
        {user.display_name?.trim() ? (
          <span className="truncate">{user.display_name.trim()}</span>
        ) : null}
        {user.display_name?.trim() ? (
          <span className="text-border" aria-hidden>
            ·
          </span>
        ) : null}
        <span className="shrink-0 font-mono tracking-wide">{wallet}</span>
      </span>
    </span>
  );
}

export const UserEmailCombobox = ({
  role,
  label,
  value,
  onChange,
  placeholder = "Search by email…",
}: UserEmailComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    users,
    isFetching,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
    isPending,
  } = useUserEmailSearch(role, query, open);

  const listRef = useRef<HTMLDivElement | null>(null);

  const focusSearchInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const onListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) {
      return;
    }
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < 48) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const showInitialLoading =
    (isPending || isFetching) && !isFetchingNextPage && users.length === 0;
  const showEmpty = !showInitialLoading && !isError && users.length === 0;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-10 w-full justify-between gap-2 py-2 font-normal"
          >
            {value ? (
              <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                <UserOptionAvatar user={value} />
                <UserOptionMeta user={value} />
              </span>
            ) : (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2 sm:w-80"
          align="start"
          initialFocus={() => {
            // Default popup focus scrolls the page to the portal node (top).
            queueMicrotask(focusSearchInput);
            return false;
          }}
        >
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <div
            ref={listRef}
            onScroll={onListScroll}
            className="mt-2 max-h-56 overflow-y-auto"
          >
            {showInitialLoading ? (
              <StatusMessage>Loading users…</StatusMessage>
            ) : isError ? (
              <StatusMessage tone="destructive">
                Could not load users
              </StatusMessage>
            ) : showEmpty ? (
              <StatusMessage>
                {query.trim()
                  ? "No users found for that email"
                  : "No users available"}
              </StatusMessage>
            ) : (
              <ul className="space-y-1">
                {users.map((user) => {
                  const selected = value?.user_id === user.user_id;
                  return (
                    <li key={user.user_id}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-muted",
                          selected && "bg-muted",
                        )}
                        onClick={() => {
                          onChange(user);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "size-4 shrink-0",
                            selected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <UserOptionAvatar user={user} />
                        <UserOptionMeta user={user} />
                      </button>
                    </li>
                  );
                })}
                {isFetchingNextPage ? (
                  <li className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Loading more…
                  </li>
                ) : null}
                {!hasNextPage && users.length > 0 ? (
                  <li className="px-2 py-2 text-center text-[11px] text-muted-foreground">
                    {users.length} user{users.length === 1 ? "" : "s"}
                  </li>
                ) : null}
              </ul>
            )}
          </div>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => onChange(null)}
            >
              Clear Selection
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
};
