import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { LOCALE_COOKIE } from "./cookie";
import { getMessages } from "./get-messages";
import { defaultLocale, isAppLocale } from "./locales";

export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  const locale = isAppLocale(raw) ? raw : defaultLocale;

  return {
    locale,
    messages: getMessages(locale),
  };
});
