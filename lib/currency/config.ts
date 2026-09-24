export const baseCurrency = "CAD" as const;

export type CurrencyCode =
  | "CAD"
  | "USD"
  | "EUR"
  | "GBP"
  | "TRY"
  | "JPY"
  | "CNY"
  | "AUD"
  | "BRL"
  | "MXN"
  | "CHF"
  | "AED";

/**
 * Display / presentment currencies we are willing to offer in the UI.
 * Only Stripe-supported codes are listed — never invent unsupported options.
 * Final charge currency is decided at Stripe Checkout (Adaptive Pricing or CAD).
 */
export const displayCurrencies: readonly CurrencyCode[] = [
  "CAD",
  "USD",
  "EUR",
  "GBP",
  "TRY",
  "JPY",
  "CNY",
  "AUD",
  "BRL",
  "MXN",
  "CHF",
  "AED",
] as const;

export const currencyCookieName = "chocobanana_currency";

export const currencyLabels: Record<CurrencyCode, string> = {
  CAD: "CAD — Canadian Dollar",
  USD: "USD — US Dollar",
  EUR: "EUR — Euro",
  GBP: "GBP — British Pound",
  TRY: "TRY — Turkish Lira",
  JPY: "JPY — Japanese Yen",
  CNY: "CNY — Chinese Yuan",
  AUD: "AUD — Australian Dollar",
  BRL: "BRL — Brazilian Real",
  MXN: "MXN — Mexican Peso",
  CHF: "CHF — Swiss Franc",
  AED: "AED — UAE Dirham",
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (displayCurrencies as readonly string[]).includes(value);
}

/**
 * Format a catalog price for browsing.
 * Source of truth is always CAD cents. Non-CAD selections do not invent FX —
 * they keep the CAD amount and surface the preferred currency for checkout.
 */
export function formatCatalogPrice(options: {
  amountCadCents: number;
  locale: string;
  preferredCurrency: CurrencyCode;
}): { primary: string; isEstimateOnly: boolean; preferredCurrency: CurrencyCode } {
  const { amountCadCents, locale, preferredCurrency } = options;
  const amount = amountCadCents / 100;

  const primary = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: baseCurrency,
    currencyDisplay: "symbol",
  }).format(amount);

  return {
    primary,
    isEstimateOnly: preferredCurrency !== baseCurrency,
    preferredCurrency,
  };
}
