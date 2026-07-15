export type FormatAmountOptions = {
  currency?: string;
  /** Prepend currency code when set. Defaults to true if `currency` is provided. */
  withCurrency?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

/**
 * Format a numeric amount for display (commas + fixed decimals).
 * Use for escrow totals, balances, and milestone amounts.
 */
export function formatAmountForDisplay(
  value: number | string | null | undefined,
  options: FormatAmountOptions = {},
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numeric =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value).replaceAll(",", "").trim());

  if (!Number.isFinite(numeric)) {
    return "—";
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(numeric);

  const currency = options.currency?.trim();
  const withCurrency = options.withCurrency ?? Boolean(currency);
  if (withCurrency && currency) {
    return `${currency} ${formatted}`;
  }

  return formatted;
}

/**
 * Format the currency (amount with currency code).
 */
export function formatCurrency(value: number, currency: string): string {
  return formatAmountForDisplay(value, { currency, withCurrency: true });
}

/**
 * Format the timestamp
 *
 * @param ts - The timestamp
 * @returns The formatted timestamp
 */
export function formatTimestamp(ts?: {
  _seconds: number;
  _nanoseconds: number;
}) {
  if (!ts) return "-";
  const d = new Date(ts._seconds * 1000);
  return d.toLocaleString();
}

/**
 * Format the address
 *
 * @param address - The address
 * @returns The formatted address
 */
export function formatAddress(address: string | undefined, length: number = 10) {
  if (!address) return "—";
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Format the role
 *
 * @param role - The role
 * @returns The formatted role
 */
export function formatRole(role: string) {
  return role
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format the text
 *
 * @param text - The text
 * @returns The formatted text
 */
export function formatText(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
