export const locales = [
  "en",
  "fr",
  "tr",
  "es",
  "de",
  "it",
  "pt",
  "ar",
  "ja",
  "zh",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeCookieName = "chocobanana_locale";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  tr: "Türkçe",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  ar: "العربية",
  ja: "日本語",
  zh: "中文",
};

export const rtlLocales: ReadonlySet<Locale> = new Set(["ar"]);

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}

/** Map BCP 47 / Accept-Language tags onto supported locales. */
export function matchLocale(tag: string): Locale | null {
  const normalized = tag.trim().toLowerCase().replace("_", "-");
  if (!normalized) return null;

  const exact = locales.find((locale) => locale === normalized);
  if (exact) return exact;

  const base = normalized.split("-")[0] ?? "";
  if (base === "zh") return "zh";
  if (isLocale(base)) return base;

  return null;
}
