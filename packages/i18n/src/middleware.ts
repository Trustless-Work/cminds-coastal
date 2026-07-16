import { type NextRequest, NextResponse } from "next/server";

import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "./cookie";
import { isAppLocale } from "./locales";
import { resolveLocaleFromAcceptLanguage } from "./resolve-locale";

/**
 * Sets `NEXT_LOCALE` from Accept-Language when the cookie is missing.
 * Does not rewrite URLs — locale is cookie-only.
 */
export function createI18nMiddleware() {
  return function i18nMiddleware(request: NextRequest): NextResponse {
    const existing = request.cookies.get(LOCALE_COOKIE)?.value;
    if (isAppLocale(existing)) {
      return NextResponse.next();
    }

    const locale = resolveLocaleFromAcceptLanguage(
      request.headers.get("accept-language"),
    );
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  };
}
