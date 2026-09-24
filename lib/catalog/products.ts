import { baseCurrency } from "@/lib/currency/config";

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
  /** Only for kind === "subscription" */
  interval?: "month";
  /** Offered in checkout when payments mode allows */
  purchasable: boolean;
};

/**
 * Server-side catalog. Amounts are CAD cents only.
 * Replace with CMS / admin DB later; keep the same id + amount contract.
 */
export const catalogProducts: readonly CatalogProduct[] = [
  {
    id: "letter-sets",
    shopKey: "letterSets",
    nameEn: "Letter Sets",
    descriptionEn: "Soft paper letter set for kind notes.",
    kind: "one_time",
    amountCadCents: 1800,
    currency: baseCurrency,
    purchasable: true,
  },
  {
    id: "sticker-sheets",
    shopKey: "stickerSheets",
    nameEn: "Sticker Sheets",
    descriptionEn: "Stars, hearts, and envelope doodles.",
    kind: "one_time",
    amountCadCents: 1200,
    currency: baseCurrency,
    purchasable: true,
  },
  {
    id: "sealing-touches",
    shopKey: "sealingTouches",
    nameEn: "Sealing Touches",
    descriptionEn: "Wax seal and ribbon finishing kit.",
    kind: "one_time",
    amountCadCents: 2200,
    currency: baseCurrency,
    purchasable: true,
  },
  {
    id: "keepsake-notes",
    shopKey: "keepsakeNotes",
    nameEn: "Keepsake Notes",
    descriptionEn: "Small cards for letters and desks.",
    kind: "one_time",
    amountCadCents: 1000,
    currency: baseCurrency,
    purchasable: true,
  },
  {
    id: "mail-club-monthly",
    nameEn: "Mail Club Monthly",
    descriptionEn: "Monthly mail club membership (subscription example).",
    kind: "subscription",
    amountCadCents: 2800,
    currency: baseCurrency,
    interval: "month",
    purchasable: true,
  },
] as const;

export function getCatalogProduct(id: string): CatalogProduct | undefined {
  return catalogProducts.find((product) => product.id === id);
}

export function getPurchasableProducts(): CatalogProduct[] {
  return catalogProducts.filter((product) => product.purchasable);
}
