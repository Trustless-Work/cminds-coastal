import { defaultLocale, type AppLocale, isAppLocale } from "./locales";

/**
 * Picks the best supported locale from an Accept-Language header.
 * Falls back to `en` when none of the preferred languages match.
 */
export function resolveLocaleFromAcceptLanguage(
  header: string | null,
): AppLocale {
  if (!header) {
    return defaultLocale;
  }

  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return {
        tag: (tag ?? "").trim().toLowerCase(),
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .filter((c) => c.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    if (isAppLocale(tag)) {
      return tag;
    }
    const primary = tag.split("-")[0];
    if (isAppLocale(primary)) {
      return primary;
    }
  }

  return defaultLocale;
}
