"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLocale } from "./actions";
import { locales, type AppLocale, isAppLocale } from "./locales";

const LOCALE_LABEL_KEYS: Record<
  AppLocale,
  "localeEn" | "localeEs" | "localeFr"
> = {
  en: "localeEn",
  es: "localeEs",
  fr: "localeFr",
};

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current: AppLocale = isAppLocale(locale) ? locale : "en";

  function onLocaleChange(next: string | null) {
    if (!next || !isAppLocale(next) || next === current) {
      return;
    }

    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <Select
      value={current}
      onValueChange={onLocaleChange}
      disabled={isPending}
    >
      <SelectTrigger
        size="sm"
        className="h-11 w-[8.5rem] shrink-0 rounded-full border-0 bg-white px-3 text-xs font-medium uppercase tracking-wide text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.05)] ring-1 ring-border/80 hover:bg-white hover:opacity-80 focus-visible:border-transparent focus-visible:ring-1 focus-visible:ring-border/80 data-[size=sm]:h-11 data-[size=sm]:rounded-full data-[size=sm]:text-xs"
        aria-label={t("language")}
      >
        <SelectValue className="uppercase" />
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((code) => (
          <SelectItem key={code} value={code} className="uppercase">
            {t(LOCALE_LABEL_KEYS[code])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
