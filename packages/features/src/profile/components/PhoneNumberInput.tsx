"use client";

import { Input } from "@repo/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  composePhoneNumber,
  flagEmoji,
  parsePhoneNumber,
  type Country,
} from "../constants/countries";

type PhoneNumberInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
};

export const PhoneNumberInput = ({
  id,
  value,
  onChange,
  placeholder = "88887777",
  invalid,
}: PhoneNumberInputProps) => {
  const initial = parsePhoneNumber(value);
  const [country, setCountry] = useState<Country>(
    initial.country ?? DEFAULT_COUNTRY,
  );
  const [national, setNational] = useState(initial.national);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const numberRef = useRef<HTMLInputElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value === lastEmitted.current) {
      return;
    }
    const parsed = parsePhoneNumber(value);
    setCountry(parsed.country ?? DEFAULT_COUNTRY);
    setNational(parsed.national);
    lastEmitted.current = value;
  }, [value]);

  const emit = useCallback(
    (nextCountry: Country, nextNational: string) => {
      const composed = composePhoneNumber(nextCountry, nextNational);
      lastEmitted.current = composed;
      onChange(composed);
    },
    [onChange],
  );

  const handleCountrySelect = (next: Country) => {
    setCountry(next);
    emit(next, national);
    setOpen(false);
    setQuery("");
    numberRef.current?.focus();
  };

  const handleNationalChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setNational(digits);
    emit(country, digits);
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return COUNTRIES;
    }
    const withoutPlus = term.replace(/^\+/, "");
    return COUNTRIES.filter(
      (entry) =>
        entry.name.toLowerCase().includes(term) ||
        entry.dialCode.replace("+", "").startsWith(withoutPlus),
    );
  }, [query]);

  return (
    <div className={cn("flex", invalid && "rounded-xl ring-2 ring-destructive/30")}>
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
            type="button"
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-l-xl border border-r-0 border-border bg-background px-3 text-sm transition-colors hover:bg-background-secondary focus-visible:z-10 focus-visible:border-foreground/20 focus-visible:ring-3 focus-visible:ring-foreground/10 focus-visible:outline-none"
            aria-label={`Country code: ${country.name} ${country.dialCode}`}
          >
            <span className="text-base leading-none">
              {flagEmoji(country.iso2)}
            </span>
            <span className="font-medium text-foreground">
              {country.dialCode}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-2"
          align="start"
          initialFocus={() => {
            queueMicrotask(() =>
              searchRef.current?.focus({ preventScroll: true }),
            );
            return false;
          }}
        >
          <Input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search country or code…"
          />
          <ul className="mt-2 max-h-60 space-y-0.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                No countries found
              </li>
            ) : (
              filtered.map((entry) => {
                const selected = entry.iso2 === country.iso2;
                return (
                  <li key={entry.iso2}>
                    <button
                      type="button"
                      onClick={() => handleCountrySelect(entry)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm hover:bg-muted",
                        selected && "bg-muted",
                      )}
                    >
                      <span className="text-base leading-none">
                        {flagEmoji(entry.iso2)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {entry.name}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {entry.dialCode}
                      </span>
                      <Check
                        className={cn(
                          "size-4 shrink-0",
                          selected ? "opacity-100" : "opacity-0",
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

      <Input
        id={id}
        ref={numberRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={national}
        onChange={(event) => handleNationalChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-l-none"
        aria-invalid={invalid}
      />
    </div>
  );
};
