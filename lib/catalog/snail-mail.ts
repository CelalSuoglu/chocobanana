import { CHECKOUT_SHIPPING_COUNTRIES } from "@/lib/stripe/shipping";

/**
 * Prepaid Snail Mail Club totals in CAD dollars.
 * This table is the only price source. Postage is included.
 * One envelope is sent each month of the package.
 */
export const SNAIL_MAIL_PRICE_CAD = {
  canada: { 1: 12, 3: 36, 6: 72, 12: 144 },
  usa: { 1: 13, 3: 39, 6: 78, 12: 156 },
  international: { 1: 16, 3: 48, 6: 96, 12: 192 },
} as const;

export const SNAIL_MAIL_TERMS = [1, 3, 6, 12] as const;
export const SNAIL_MAIL_REGIONS = ["canada", "usa", "international"] as const;

export type SnailMailTerm = (typeof SNAIL_MAIL_TERMS)[number];
export type SnailMailRegion = (typeof SNAIL_MAIL_REGIONS)[number];

export function isSnailMailTerm(value: number): value is SnailMailTerm {
  return (SNAIL_MAIL_TERMS as readonly number[]).includes(value);
}

export function isSnailMailRegion(value: string): value is SnailMailRegion {
  return (SNAIL_MAIL_REGIONS as readonly string[]).includes(value);
}

export function snailMailPriceCadCents(
  region: SnailMailRegion,
  term: SnailMailTerm,
): number {
  return SNAIL_MAIL_PRICE_CAD[region][term] * 100;
}

export function snailMailTermLabel(term: SnailMailTerm): string {
  if (term === 12) return "1 year";
  if (term === 1) return "1 month";
  return `${term} months`;
}

export function snailMailRegionLabel(region: SnailMailRegion): string {
  if (region === "canada") return "Canada";
  if (region === "usa") return "USA";
  return "International";
}

export function snailMailProductId(
  term: SnailMailTerm,
  region: SnailMailRegion,
): string {
  return `snail-mail-${term}-${region}`;
}

export function parseSnailMailProductId(
  productId: string,
): { term: SnailMailTerm; region: SnailMailRegion } | null {
  const match = /^snail-mail-(1|3|6|12)-(canada|usa|international)$/.exec(
    productId,
  );
  if (!match) return null;
  const term = Number(match[1]);
  const region = match[2];
  if (!isSnailMailTerm(term) || !isSnailMailRegion(region)) return null;
  return { term, region };
}

/** Countries Stripe may collect for a priced region. */
export function countriesForSnailMailRegion(
  region: SnailMailRegion,
): string[] {
  if (region === "canada") return ["CA"];
  if (region === "usa") return ["US"];
  return CHECKOUT_SHIPPING_COUNTRIES.filter(
    (code) => code !== "CA" && code !== "US",
  );
}

export function snailMailRegionForCountry(
  country: string | null | undefined,
): SnailMailRegion | null {
  if (!country) return null;
  const code = country.trim().toUpperCase();
  if (code === "CA") return "canada";
  if (code === "US") return "usa";
  if (
    CHECKOUT_SHIPPING_COUNTRIES.includes(
      code as (typeof CHECKOUT_SHIPPING_COUNTRIES)[number],
    )
  ) {
    return "international";
  }
  return null;
}
