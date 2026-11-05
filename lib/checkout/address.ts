import {
  CHECKOUT_SHIPPING_COUNTRIES,
  type CheckoutShippingCountry,
} from "@/lib/stripe/shipping";
import {
  countriesForSnailMailRegion,
  snailMailRegionForCountry,
  type SnailMailRegion,
} from "@/lib/catalog/snail-mail";

export type DeliveryDetails = {
  firstName: string;
  lastName: string;
  email: string;
  country: CheckoutShippingCountry;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
};

export const CA_PROVINCES = [
  ["AB", "Alberta"],
  ["BC", "British Columbia"],
  ["MB", "Manitoba"],
  ["NB", "New Brunswick"],
  ["NL", "Newfoundland and Labrador"],
  ["NS", "Nova Scotia"],
  ["NT", "Northwest Territories"],
  ["NU", "Nunavut"],
  ["ON", "Ontario"],
  ["PE", "Prince Edward Island"],
  ["QC", "Quebec"],
  ["SK", "Saskatchewan"],
  ["YT", "Yukon"],
] as const;

export const US_STATES = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
] as const;

const COUNTRY_LABELS: Record<CheckoutShippingCountry, string> = {
  CA: "Canada",
  US: "United States",
  AU: "Australia",
  FR: "France",
  DE: "Germany",
  TR: "Türkiye",
};

export function deliveryCountryOptions(): Array<{
  code: CheckoutShippingCountry;
  label: string;
}> {
  return CHECKOUT_SHIPPING_COUNTRIES.map((code) => ({
    code,
    label: COUNTRY_LABELS[code],
  }));
}

export function regionChoices(country: string): ReadonlyArray<readonly [string, string]> | null {
  if (country === "CA") return CA_PROVINCES;
  if (country === "US") return US_STATES;
  return null;
}

function cleanLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export type DeliveryField =
  | "firstName"
  | "lastName"
  | "email"
  | "country"
  | "line1"
  | "city"
  | "region"
  | "postalCode"
  | "phone";

export type DeliveryFieldError = "required" | "email" | "postal" | "phone" | "region" | "country";

/** Field-level checks used by the delivery form. Does not change pricing. */
export function deliveryFieldErrors(
  input: Record<string, unknown>,
  allowedCountries: readonly string[],
): Partial<Record<DeliveryField, DeliveryFieldError>> {
  const errors: Partial<Record<DeliveryField, DeliveryFieldError>> = {};
  const country = cleanLine(input.country, 2).toUpperCase();
  if (!country || !allowedCountries.includes(country)) errors.country = "country";
  if (!cleanLine(input.firstName, 60)) errors.firstName = "required";
  if (!cleanLine(input.lastName, 60)) errors.lastName = "required";
  const email = cleanLine(input.email, 120);
  if (!email) errors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "email";
  if (!cleanLine(input.line1, 120)) errors.line1 = "required";
  if (!cleanLine(input.city, 80)) errors.city = "required";
  const region = cleanLine(input.region, 40);
  const choices = regionChoices(country);
  if (!region) errors.region = "required";
  else if (choices && !choices.some(([code]) => code === region)) errors.region = "region";
  const postal = cleanLine(input.postalCode, 16).toUpperCase();
  if (!postal) errors.postalCode = "required";
  else if (country && allowedCountries.includes(country) && !postalOk(country, postal)) {
    errors.postalCode = "postal";
  }
  const phone = cleanLine(input.phone, 20);
  if (!phone) errors.phone = "required";
  else if (!phoneOk(phone)) errors.phone = "phone";
  return errors;
}

function postalOk(country: string, postal: string): boolean {
  if (country === "CA") return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postal);
  if (country === "US") return /^\d{5}(-\d{4})?$/.test(postal);
  return /^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/.test(postal);
}

function phoneOk(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && /^\+?[0-9 ().-]{8,20}$/.test(phone);
}

export function parseDeliveryDetails(
  input: unknown,
  allowedCountries: readonly string[],
): { ok: true; value: DeliveryDetails } | { ok: false; error: "address_invalid" | "country_mismatch" } {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const country = cleanLine(raw.country, 2).toUpperCase();
  if (!allowedCountries.includes(country)) {
    return { ok: false, error: "country_mismatch" };
  }
  const region = cleanLine(raw.region, 40);
  const choices = regionChoices(country);
  if (choices && !choices.some(([code]) => code === region)) {
    return { ok: false, error: "address_invalid" };
  }
  const value: DeliveryDetails = {
    firstName: cleanLine(raw.firstName, 60),
    lastName: cleanLine(raw.lastName, 60),
    email: cleanLine(raw.email, 120).toLowerCase(),
    country: country as CheckoutShippingCountry,
    line1: cleanLine(raw.line1, 120),
    line2: cleanLine(raw.line2, 120),
    city: cleanLine(raw.city, 80),
    region,
    postalCode: cleanLine(raw.postalCode, 16).toUpperCase(),
    phone: cleanLine(raw.phone, 20),
  };
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email);
  if (
    !value.firstName ||
    !value.lastName ||
    !emailOk ||
    !value.line1 ||
    !value.city ||
    !value.region ||
    !postalOk(value.country, value.postalCode) ||
    !phoneOk(value.phone)
  ) {
    return { ok: false, error: "address_invalid" };
  }
  return { ok: true, value };
}

export function allowedCountriesForRegions(
  regions: SnailMailRegion[],
): CheckoutShippingCountry[] {
  if (regions.length === 0) return [...CHECKOUT_SHIPPING_COUNTRIES];
  const unique = [...new Set(regions)];
  if (unique.length !== 1) return [];
  return countriesForSnailMailRegion(unique[0]).filter((code): code is CheckoutShippingCountry =>
    (CHECKOUT_SHIPPING_COUNTRIES as readonly string[]).includes(code),
  );
}

export function deliveryRegionLabel(country: string): SnailMailRegion | null {
  return snailMailRegionForCountry(country);
}
