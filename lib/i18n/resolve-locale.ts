import {
  defaultLocale,
  isLocale,
  localeCookieName,
  matchLocale,
  type Locale,
} from "./config";

export function resolveLocaleFromAcceptLanguage(
  header: string | null,
): Locale {
  if (!header) return defaultLocale;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1] ?? "1") : 1;
      return { tag: tag?.trim() ?? "", q: Number.isFinite(q) ? q : 0 };
    })
    .filter((item) => item.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    const matched = matchLocale(tag);
    if (matched) return matched;
  }

  return defaultLocale;
}

export function resolvePreferredLocale(options: {
  cookieValue: string | undefined;
  acceptLanguage: string | null;
}): Locale {
  const { cookieValue, acceptLanguage } = options;
  if (cookieValue && isLocale(cookieValue)) return cookieValue;
  return resolveLocaleFromAcceptLanguage(acceptLanguage);
}

export { localeCookieName };
