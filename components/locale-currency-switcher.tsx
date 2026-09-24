"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  localeCookieName,
  localeLabels,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import {
  currencyCookieName,
  currencyLabels,
  displayCurrencies,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency/config";

type LocaleCurrencySwitcherProps = {
  locale: Locale;
  currency: CurrencyCode;
  labels: {
    language: string;
    currency: string;
    selectLanguage: string;
    selectCurrency: string;
  };
};

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LocaleCurrencySwitcher({
  locale,
  currency,
  labels,
}: LocaleCurrencySwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onLocaleChange(nextLocale: string) {
    if (nextLocale === locale || !locales.includes(nextLocale as Locale)) {
      return;
    }

    setCookie(localeCookieName, nextLocale);
    startTransition(() => {
      router.push(`/${nextLocale}`);
      router.refresh();
    });
  }

  function onCurrencyChange(nextCurrency: string) {
    if (!isCurrencyCode(nextCurrency) || nextCurrency === currency) return;
    setCookie(currencyCookieName, nextCurrency);
    startTransition(() => {
      router.refresh();
    });
  }

  const selectClass =
    "min-h-10 min-w-[7.5rem] max-w-[46vw] rounded-full border border-pink/45 bg-paper/90 px-3 py-2 font-serif text-sm text-chocolate shadow-sm outline-none transition-colors hover:border-pink-deep focus-visible:ring-2 focus-visible:ring-pink md:max-w-none md:min-w-[9rem]";

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 md:justify-end ${isPending ? "opacity-70" : ""}`}
    >
      <label className="sr-only" htmlFor="language-select">
        {labels.selectLanguage}
      </label>
      <select
        id="language-select"
        className={selectClass}
        value={locale}
        aria-label={labels.selectLanguage}
        onChange={(event) => onLocaleChange(event.target.value)}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="currency-select">
        {labels.selectCurrency}
      </label>
      <select
        id="currency-select"
        className={selectClass}
        value={currency}
        aria-label={labels.selectCurrency}
        onChange={(event) => onCurrencyChange(event.target.value)}
      >
        {displayCurrencies.map((code) => (
          <option key={code} value={code}>
            {currencyLabels[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
