import type { Locale } from "./config";
import { defaultLocale, isLocale } from "./config";
import type en from "../../messages/en.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("../../messages/en.json").then((m) => m.default),
  fr: () => import("../../messages/fr.json").then((m) => m.default),
  tr: () => import("../../messages/tr.json").then((m) => m.default),
  es: () => import("../../messages/es.json").then((m) => m.default),
  de: () => import("../../messages/de.json").then((m) => m.default),
  it: () => import("../../messages/it.json").then((m) => m.default),
  pt: () => import("../../messages/pt.json").then((m) => m.default),
  ar: () => import("../../messages/ar.json").then((m) => m.default),
  ja: () => import("../../messages/ja.json").then((m) => m.default),
  zh: () => import("../../messages/zh.json").then((m) => m.default),
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  const resolved = isLocale(locale) ? locale : defaultLocale;

  try {
    return await dictionaries[resolved]();
  } catch {
    return dictionaries[defaultLocale]();
  }
}
