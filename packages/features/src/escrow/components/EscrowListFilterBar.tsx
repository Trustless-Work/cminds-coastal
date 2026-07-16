"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Building2, ListFilter, Search, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";

import type { EscrowListFilters } from "../hooks/useFundingEscrowsInfinite";
import { formatEscrowStatusLabel } from "../utils/escrow-status-display";

export type EscrowListCommunityOption = {
  community_id: string;
  name: string;
};

/** Off-chain statuses the app actually writes today. */
export const ESCROW_STATUS_FILTER_OPTIONS = [
  "INITIALIZED",
  "COMPLETED",
  "CANCELLED",
] as const;

type EscrowListFilterBarProps = {
  values: EscrowListFilters;
  statusOptions: string[];
  communityOptions?: EscrowListCommunityOption[];
  onChange: (next: EscrowListFilters) => void;
  onSearch: () => void;
  onClear?: () => void;
  className?: string;
};

const ALL_VALUE = "all";

function activeFilterCount(
  values: EscrowListFilters,
  includeCommunity: boolean,
): number {
  return [
    values.status,
    includeCommunity ? values.community : "",
    values.query.trim(),
  ].filter(Boolean).length;
}

export const EscrowListFilterBar = ({
  values,
  statusOptions,
  communityOptions,
  onChange,
  onSearch,
  onClear,
  className,
}: EscrowListFilterBarProps) => {
  const [open, setOpen] = useState(false);
  const showCommunity = Boolean(communityOptions?.length);
  const count = useMemo(
    () => activeFilterCount(values, showCommunity),
    [values, showCommunity],
  );

  function renderStatusSelect(): ReactNode {
    return (
      <Select
        value={values.status || ALL_VALUE}
        onValueChange={(next) => {
          const status = !next || next === ALL_VALUE ? "" : String(next);
          onChange({ ...values, status });
        }}
      >
        <SelectTrigger
          aria-label="Filter by status"
          className="h-11 w-full min-w-0"
        >
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="min-w-56">
          <SelectGroup>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {formatEscrowStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  function renderCommunitySelect(): ReactNode {
    if (!communityOptions?.length) return null;
    return (
      <Select
        value={values.community || ALL_VALUE}
        onValueChange={(next) => {
          const community = !next || next === ALL_VALUE ? "" : String(next);
          onChange({ ...values, community });
        }}
      >
        <SelectTrigger
          aria-label="Filter by community"
          className="h-11 w-full min-w-0"
        >
          <SelectValue placeholder="All communities" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="min-w-64">
          <SelectGroup>
            <SelectItem value={ALL_VALUE}>All communities</SelectItem>
            {communityOptions.map((community) => (
              <SelectItem
                key={community.community_id}
                value={community.community_id}
              >
                {community.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-end gap-2">
        {count > 0 && onClear ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Clear all filters"
            onClick={onClear}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="gap-2"
        >
          <ListFilter className="size-4" />
          Filter
          {count > 0 ? (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
              {count}
            </span>
          ) : null}
        </Button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="rounded-[24px] border border-border bg-background p-5 sm:p-6 md:p-8">
            <div
              className={cn(
                "grid gap-5 sm:gap-6",
                showCommunity
                  ? "md:grid-cols-2 xl:grid-cols-[minmax(200px,240px)_minmax(220px,280px)_minmax(280px,1fr)_auto]"
                  : "md:grid-cols-[minmax(200px,260px)_minmax(280px,1fr)_auto]",
              )}
            >
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                {renderStatusSelect()}
              </div>

              {showCommunity ? (
                <div className="min-w-0 space-y-2">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Building2 className="size-3.5" />
                    Community
                  </p>
                  {renderCommunitySelect()}
                </div>
              ) : null}

              <div
                className={cn(
                  "min-w-0 space-y-2",
                  showCommunity && "md:col-span-2 xl:col-span-1",
                )}
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Search
                </p>
                <Input
                  value={values.query}
                  placeholder="Title, description, engagement…"
                  aria-label="Search escrows"
                  className="h-11"
                  onChange={(event) => {
                    onChange({ ...values, query: event.target.value });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onSearch();
                    }
                  }}
                />
              </div>

              <div
                className={cn(
                  "flex items-end",
                  showCommunity && "md:col-span-2 xl:col-span-1",
                )}
              >
                <Button
                  type="button"
                  className="h-11 w-full gap-2 xl:w-auto xl:min-w-28"
                  onClick={onSearch}
                >
                  <Search className="size-4" />
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
