"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  ChevronDown,
  CircleDollarSign,
  ListFilter,
  Search,
} from "lucide-react";
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

export type TransparencyFilterValues = {
  status: string;
  community: string;
  query: string;
};

type TransparencyFilterCardProps = {
  values: TransparencyFilterValues;
  statusOptions: string[];
  communityOptions: string[];
  onChange: (next: TransparencyFilterValues) => void;
  onSearch: () => void;
  className?: string;
};

const ALL_VALUE = "all";

const Field = ({
  icon,
  label,
  children,
  className,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex min-w-0 flex-1 items-center gap-3 px-4 py-3 sm:px-5 sm:py-4",
      className,
    )}
  >
    <span className="shrink-0 text-foreground [&_svg]:size-5">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  </div>
);

function activeFilterCount(values: TransparencyFilterValues): number {
  return [values.status, values.community, values.query.trim()].filter(Boolean)
    .length;
}

function filterSummary(values: TransparencyFilterValues): string {
  const parts: string[] = [];
  if (values.status) parts.push(values.status);
  if (values.community) parts.push(values.community);
  if (values.query.trim()) parts.push(`“${values.query.trim()}”`);
  if (parts.length === 0) return "Tap to refine results";
  return parts.join(" · ");
}

function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const TransparencyFilterCard = ({
  values,
  statusOptions,
  communityOptions,
  onChange,
  onSearch,
  className,
}: TransparencyFilterCardProps) => {
  const [open, setOpen] = useState(false);
  const count = useMemo(() => activeFilterCount(values), [values]);

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
          variant="ghost"
          aria-label="Filter by status"
          className="w-full min-w-0"
        >
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="min-w-48">
          <SelectGroup>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {formatStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  function renderCommunitySelect(): ReactNode {
    return (
      <Select
        value={values.community || ALL_VALUE}
        onValueChange={(next) => {
          const community = !next || next === ALL_VALUE ? "" : String(next);
          onChange({ ...values, community });
        }}
      >
        <SelectTrigger
          variant="ghost"
          aria-label="Filter by community"
          className="w-full min-w-0"
        >
          <SelectValue placeholder="All communities" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="min-w-52">
          <SelectGroup>
            <SelectItem value={ALL_VALUE}>All communities</SelectItem>
            {communityOptions.map((community) => (
              <SelectItem key={community} value={community}>
                {community}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  function renderSearchInput(collapseOnEnter: boolean): ReactNode {
    return (
      <Input
        type="search"
        aria-label="Search escrows"
        placeholder="Title or area…"
        value={values.query}
        onChange={(event) => onChange({ ...values, query: event.target.value })}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSearch();
            if (collapseOnEnter) setOpen(false);
          }
        }}
        className="h-auto min-h-0 rounded-none border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0"
      />
    );
  }

  function handleApply(): void {
    onSearch();
    setOpen(false);
  }

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] sm:hidden",
          className,
        )}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls="transparency-filters-panel"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background-tertiary text-foreground">
            <ListFilter className="size-5" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Filters
              </span>
              {count > 0 ? (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block truncate text-sm text-muted-foreground">
              {filterSummary(values)}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-foreground transition-transform duration-[250ms] ease-out",
              open && "rotate-180",
            )}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        <div
          id="transparency-filters-panel"
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-1 border-t border-border px-2 pb-3 pt-1">
              <Field icon={<ListFilter strokeWidth={2} />} label="Status">
                {renderStatusSelect()}
              </Field>
              <div className="mx-4 h-px bg-border" aria-hidden />
              <Field icon={<Building2 strokeWidth={2} />} label="Community">
                {renderCommunitySelect()}
              </Field>
              <div className="mx-4 h-px bg-border" aria-hidden />
              <Field icon={<CircleDollarSign strokeWidth={2} />} label="Search">
                {renderSearchInput(true)}
              </Field>
              <div className="px-3 pt-2">
                <Button
                  type="button"
                  className="h-11 w-full gap-2"
                  onClick={handleApply}
                >
                  <Search className="size-4" strokeWidth={2} />
                  Apply filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "hidden overflow-hidden rounded-full border border-border bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] sm:flex sm:items-center",
          className,
        )}
      >
        <Field icon={<ListFilter strokeWidth={2} />} label="Status">
          {renderStatusSelect()}
        </Field>
        <div className="mx-4 h-10 w-px shrink-0 bg-border" aria-hidden />
        <Field icon={<Building2 strokeWidth={2} />} label="Community">
          {renderCommunitySelect()}
        </Field>
        <div className="mx-4 h-10 w-px shrink-0 bg-border" aria-hidden />
        <Field icon={<CircleDollarSign strokeWidth={2} />} label="Search">
          {renderSearchInput(false)}
        </Field>
        <div className="flex shrink-0 items-center justify-end p-2 pl-0 pr-2">
          <Button
            type="button"
            size="icon-lg"
            aria-label="Apply filters"
            onClick={onSearch}
            className="size-[64px]"
          >
            <Search className="size-5 text-primary-foreground" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </>
  );
};
