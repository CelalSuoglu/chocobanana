import { baseCurrency } from "@/lib/currency/config";
import {
  SNAIL_MAIL_REGIONS,
  SNAIL_MAIL_TERMS,
  snailMailPriceCadCents,
  snailMailProductId,
  snailMailRegionLabel,
  snailMailTermLabel,
  type SnailMailRegion,
  type SnailMailTerm,
} from "@/lib/catalog/snail-mail";
import { stickerSheetListings } from "@/lib/catalog/sticker-sheets";

/**
 * Payment kind differences (do not assume one model for the whole shop):
 *
 * one_time  → Checkout Session `mode: "payment"`
 *             Price has no `recurring`
 *             Webhook focus: `checkout.session.completed` (+ optional payment_intent.*)
 *             Adaptive Pricing: broad local methods when eligible
 *
 * subscription → Checkout Session `mode: "subscription"`
 *                Price includes `recurring: { interval }`
 *                Webhook focus: `checkout.session.completed` plus later
 *                `customer.subscription.*` / `invoice.paid` for renewals
 *                Adaptive Pricing (cross-border): cards / Link / Apple Pay / Google Pay only
 */

export type ProductKind = "one_time" | "subscription";

export type CatalogProduct = {
  /** Stable server id — never trust client amounts */
  id: string;
  /** Admin / Stripe English name */
  nameEn: string;
  descriptionEn: string;
  /** Maps to homepage shop translation key when present */
  shopKey?:
    | "letterSets"
    | "stickerSheets"
    | "sealingTouches"
    | "keepsakeNotes";
  kind: ProductKind;
  /** Source of truth for Checkout `unit_amount` */
  amountCadCents: number;
  currency: typeof baseCurrency;
  /** Public image path under /public */
  imageSrc: string;
  /** Only for kind === "subscription" */
  interval?: "month";
  /** Offered in checkout when payments mode allows */
  purchasable: boolean;
  /** Allowed in the shopping cart */
  cartEligible: boolean;
  /**
   * sticker — one-time sheet, not a club membership
   * snail_mail — one prepaid club package
   * stationery — other one-time shop goods
   */
  family: "sticker" | "snail_mail" | "stationery";
  /** Prepaid Snail Mail Club package. Price comes only from the CAD table. */
  snailMail?: {
    termMonths: SnailMailTerm;
    region: SnailMailRegion;
  };
};

/**
 * Server-side catalog. Amounts are CAD cents only.
 * Replace with CMS / admin DB later; keep the same id + amount contract.
 */
const stationeryProducts: CatalogProduct[] = [
  {
    id: "letter-sets",
    shopKey: "letterSets",
    nameEn: "Letter Sets",
    descriptionEn: "Soft paper letter set for kind notes.",
    kind: "one_time",
    amountCadCents: 1800,
    currency: baseCurrency,
    imageSrc: "/logo.jpg",
    // Placeholder goods (no real photo or final price): hidden until real.
    purchasable: false,
    cartEligible: true,
    family: "stationery",
  },
  {
    id: "sealing-touches",
    shopKey: "sealingTouches",
    nameEn: "Sealing Touches",
    descriptionEn: "Wax seal and ribbon finishing kit.",
    kind: "one_time",
    amountCadCents: 2200,
    currency: baseCurrency,
    imageSrc: "/logo.jpg",
    // Placeholder goods (no real photo or final price): hidden until real.
    purchasable: false,
    cartEligible: true,
    family: "stationery",
  },
  {
    id: "keepsake-notes",
    shopKey: "keepsakeNotes",
    nameEn: "Keepsake Notes",
    descriptionEn: "Small cards for letters and desks.",
    kind: "one_time",
    amountCadCents: 1000,
    currency: baseCurrency,
    imageSrc: "/logo.jpg",
    // Placeholder goods (no real photo or final price): hidden until real.
    purchasable: false,
    cartEligible: true,
    family: "stationery",
  },
];

const stickerProducts: CatalogProduct[] = stickerSheetListings.map((sheet) => ({
  id: sheet.id,
  nameEn: sheet.nameEn,
  descriptionEn: sheet.descriptionEn,
  kind: "one_time" as const,
  amountCadCents: sheet.amountCadCents,
  currency: baseCurrency,
  imageSrc: sheet.imageSrc,
  purchasable: true,
  cartEligible: true,
  family: "sticker" as const,
}));

const snailMailProducts: CatalogProduct[] = SNAIL_MAIL_TERMS.flatMap((term) =>
  SNAIL_MAIL_REGIONS.map((region) => ({
    id: snailMailProductId(term, region),
    nameEn: `Snail Mail Club — ${snailMailTermLabel(term)} — ${snailMailRegionLabel(region)}`,
    descriptionEn: `${term} envelope${term === 1 ? "" : "s"}, one each month. Standard postage is included. Paid once and does not renew.`,
    kind: "one_time" as const,
    amountCadCents: snailMailPriceCadCents(region, term),
    currency: baseCurrency,
    imageSrc: "/logo.jpg",
    purchasable: true,
    cartEligible: true,
    family: "snail_mail" as const,
    snailMail: { termMonths: term, region },
  })),
);

export const catalogProducts: readonly CatalogProduct[] = [
  ...stationeryProducts,
  ...stickerProducts,
  ...snailMailProducts,
];

export function getCatalogProduct(id: string): CatalogProduct | undefined {
  return catalogProducts.find((product) => product.id === id);
}

export function getPurchasableProducts(): CatalogProduct[] {
  return catalogProducts.filter((product) => product.purchasable);
}

export function getCartEligibleProducts(): CatalogProduct[] {
  return catalogProducts.filter(
    (product) =>
      product.purchasable &&
      product.cartEligible &&
      product.family === "stationery",
  );
}

export function getStickerSheetProducts(): CatalogProduct[] {
  return catalogProducts.filter(
    (product) => product.purchasable && product.family === "sticker",
  );
}

/** 10% reward codes apply to one-time sticker sheets, club packages, and shop goods. */
export function isRewardDiscountProduct(product: CatalogProduct): boolean {
  return (
    product.purchasable &&
    product.kind === "one_time" &&
    (product.family === "sticker" ||
      product.family === "snail_mail" ||
      product.family === "stationery")
  );
}
