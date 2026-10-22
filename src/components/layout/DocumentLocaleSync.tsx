"use client";

import { useEffect } from "react";
import { localeDirection } from "@/i18n/locales";

/** Keeps <html lang/dir> aligned when the active route is under [country]/[locale]. */
export function DocumentLocaleSync({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDirection(locale);
  }, [locale]);

  return null;
}
