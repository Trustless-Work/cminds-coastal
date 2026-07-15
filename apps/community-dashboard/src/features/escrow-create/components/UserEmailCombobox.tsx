"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useUserEmailSearch } from "@repo/features/auth/hooks/useUserEmailSearch";
import type {
  SearchableUserRole,
  UserSearchResult,
} from "@repo/features/auth/services/users-search.service";
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

export const UserEmailCombobox = ({
  role,
  label,
  value,
  onChange,
  placeholder = "Search by email…",
}: UserEmailComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data = [], isFetching, isError } = useUserEmailSearch(role, query);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {value
                ? `${value.email}${value.display_name ? ` · ${value.display_name}` : ""}`
                : placeholder}
            </span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2 sm:w-80"
          align="start"
        >
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            autoFocus
          />
          <div className="mt-2 max-h-56 overflow-y-auto">
            {query.trim().length < 1 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Type an email to search
              </p>
            ) : isFetching ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Searching…
              </p>
            ) : isError ? (
              <p className="px-2 py-3 text-sm text-destructive">
                Could not search users
              </p>
            ) : data.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                No users found
              </p>
            ) : (
              <ul className="space-y-1">
                {data.map((user) => {
                  const selected = value?.user_id === user.user_id;
                  return (
                    <li key={user.user_id}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                          selected && "bg-muted",
                        )}
                        onClick={() => {
                          onChange(user);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            selected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {user.email}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {user.display_name || user.wallet_address}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
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
              Clear selection
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
};
