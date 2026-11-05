/**
 * Seller identity shown wherever the law asks for it: footer, contact page,
 * Terms of Sale, privacy policy, order emails and marketing emails.
 *
 * Quebec/Canadian consumer law, the EU and Turkey require the seller's name,
 * a street or mailing address and a telephone number before a consumer buys.
 * Fill `mailingAddress` and `phone` before relying on the site being complete.
 */
export const BUSINESS = {
  tradeName: "Chocobanana Mail Club",
  /** Person or registered business that sells. */
  sellerName: "Didem Keskin",
  /** e.g. "PO Box 123, Station A, Toronto, ON M5W 1A1, Canada". Empty = not yet provided. */
  mailingAddress: "Montréal (Québec), Canada",
  /** e.g. "+1 416 555 0100". Empty = not yet provided. */
  phone: "+1 437 255 7464",
  email: "thechocobananaclub@gmail.com",
  country: "Canada",
  governingLaw: "Quebec, Canada",
  /** Seller is based in Montreal, Quebec. */
  province: "Quebec",
  /** Person accountable for personal information (PIPEDA / Quebec Law 25). */
  privacyOfficer: "Didem Keskin",
  termsVersion: "2026-11-05",
} as const;

export function businessContactLines(): string[] {
  return [
    `${BUSINESS.tradeName} — ${BUSINESS.sellerName}`,
    BUSINESS.mailingAddress || null,
    BUSINESS.phone ? `Tel: ${BUSINESS.phone}` : null,
    `Email: ${BUSINESS.email}`,
  ].filter((line): line is string => Boolean(line));
}
