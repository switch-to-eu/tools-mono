import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "nl"],
  defaultLocale: "en",
});

export const localeNames = {
  en: "English",
  nl: "Nederlands",
};
