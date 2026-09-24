import { isSignupCountryCode } from "@/lib/auth/countries";

/** Normalize phone to E.164-ish: leading +, digits only after. */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return hasPlus || digits.length > 10 ? `+${digits}` : `+${digits}`;
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}

export function displayName(
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null,
): string {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  return full || fallback?.trim() || "—";
}

export function assertSignupCountry(code: string): boolean {
  return isSignupCountryCode(code);
}
