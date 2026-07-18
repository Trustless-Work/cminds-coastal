"use client";

import { Input } from "@repo/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { COUNTRIES, flagEmoji } from "../constants/countries";

type CountrySelectProps = {
  id?: string;
  /** Stored country name (free text). */
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
};

export const CountrySelect = ({
  id,
  value,
  onChange,
  placeholder = "Select your country",
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(
    () => COUNTRIES.find((entry) => entry.name === value) ?? null,
    [value],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return COUNTRIES;
    }
    return COUNTRIES.filter((entry) =>
      entry.name.toLowerCase().includes(term),
    );
  }, [query]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className="flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm transition-colors hover:bg-background-secondary focus-visible:border-foreground/20 focus-visible:ring-3 focus-visible:ring-foreground/10 focus-visible:outline-none"
        >
          {selected ? (
            <span className="text-base leading-none">
              {flagEmoji(selected.iso2)}
            </span>
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left",
              selected || value.trim() ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {selected?.name ?? (value.trim() || placeholder)}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--anchor-width)] min-w-64 p-2"
        align="start"
        initialFocus={() => {
          queueMicrotask(() => searchRef.current?.focus({ preventScroll: true }));
          return false;
        }}
      >
        <Input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search country…"
        />
        <ul className="mt-2 max-h-60 space-y-0.5 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">
              No countries found
            </li>
          ) : (
            filtered.map((entry) => {
              const isSelected = entry.name === value;
              return (
                <li key={entry.iso2}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(entry.name);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm hover:bg-muted",
                      isSelected && "bg-muted",
                    )}
                  >
                    <span className="text-base leading-none">
                      {flagEmoji(entry.iso2)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
