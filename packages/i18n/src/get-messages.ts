import type { AbstractIntlMessages } from "next-intl";

import { defaultLocale, type AppLocale, isAppLocale } from "./locales";
import en from "./messages/en.json";
import es from "./messages/es.json";

const catalogs: Record<AppLocale, AbstractIntlMessages> = {
  en,
  es,
};

export function getMessages(locale: string): AbstractIntlMessages {
  const resolved: AppLocale = isAppLocale(locale) ? locale : defaultLocale;
  return catalogs[resolved];
}
