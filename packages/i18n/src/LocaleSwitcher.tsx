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

const LOCALE_LABEL_KEYS: Record<AppLocale, "localeEn" | "localeEs"> = {
  en: "localeEn",
  es: "localeEs",
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
        className="w-[7.5rem] shrink-0"
        aria-label={t("language")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((code) => (
          <SelectItem key={code} value={code}>
            {t(LOCALE_LABEL_KEYS[code])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
