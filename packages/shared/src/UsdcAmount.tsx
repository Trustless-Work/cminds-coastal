"use client";

import { formatAmountForDisplay } from "@repo/helpers";
import { cn } from "@repo/ui/lib/utils";

/** API/mocks may use `USD` for stable dollar amounts; show USDC icon + label. */
function normalizeCurrencyForDisplay(currency: string): string {
  const upper = currency.toUpperCase();
  if (upper === "USD") {
    return "USDC";
  }
  return upper;
}

const SIZE_PX = { sm: 16, md: 20, lg: 28 } as const;

const TEXT: Record<keyof typeof SIZE_PX, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl font-semibold tracking-tight",
};

const NON_USDC_BADGE: Record<keyof typeof SIZE_PX, string> = {
  sm: "size-4 text-[9px]",
  md: "size-5 text-[10px]",
  lg: "size-7 text-xs",
};

export type UsdcAmountProps = {
  amount: number | string | null | undefined;
  currency?: string | null;
  className?: string;
  size?: keyof typeof SIZE_PX;
  /** Show the currency code after the number. Default: false when USDC (icon is enough). */
  showCurrencyCode?: boolean;
};

export function UsdcAmount({
  amount,
  currency = "USDC",
  className,
  size = "md",
  showCurrencyCode,
}: UsdcAmountProps) {
  const code = normalizeCurrencyForDisplay((currency ?? "USDC").toUpperCase());
  const isUsdc = code === "USDC";
  const px = SIZE_PX[size];
  const formatted = formatAmountForDisplay(amount);
  const includeCode = showCurrencyCode ?? !isUsdc;

  if (formatted === "—") {
    return (
      <span
        className={cn("tabular-nums text-foreground", TEXT[size], className)}
      >
        —
      </span>
    );
  }

  const accessibleLabel = `${formatted} ${code}`;

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 tabular-nums text-foreground",
        TEXT[size],
        className,
      )}
      aria-label={accessibleLabel}
    >
      {isUsdc ? (
        <img
          src="/usdc.webp"
          alt=""
          width={px}
          height={px}
          className="shrink-0 rounded-full object-cover"
          aria-hidden
        />
      ) : (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground",
            NON_USDC_BADGE[size],
          )}
          aria-hidden
        >
          {code.slice(0, 1)}
        </span>
      )}
      <span className="min-w-0 truncate" aria-hidden>
        {formatted}
        {includeCode ? ` ${code}` : null}
      </span>
    </span>
  );
}
