import { z } from "zod";
import { SITE_EMAIL } from "@/lib/site-contact";

export const INVOICE_BRAND = "Chocobanana";
export const INVOICE_CONTACT_EMAIL = SITE_EMAIL;

export class InvoiceValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super("invoice_invalid");
    this.name = "InvoiceValidationError";
    this.issues = issues;
  }
}

const money = z.number().int().nonnegative().max(5_000_000);
const optionalText = (max: number) =>
  z.string().trim().max(max).nullable();

export const invoiceLineSchema = z.object({
  name: z.string().trim().min(1).max(160),
  quantity: z.number().int().positive().max(99),
  unitAmountCadCents: money,
});

export const invoiceDocumentSchema = z.object({
  orderNumber: z.string().trim().min(1).max(32),
  createdAt: z.date(),
  customerName: optionalText(120),
  customerEmail: z.string().trim().email().max(160),
  customerPhone: optionalText(32),
  shippingName: optionalText(120),
  shippingLine1: optionalText(160),
  shippingLine2: optionalText(160),
  shippingCity: optionalText(80),
  shippingState: optionalText(40),
  shippingPostalCode: optionalText(16),
  shippingCountry: optionalText(8),
  items: z.array(invoiceLineSchema).min(1).max(12),
  shippingAmountCadCents: money.nullable(),
  taxAmountCadCents: money.nullable(),
  discountAmountCadCents: money.nullable(),
  amountTotalCadCents: money,
  locale: z.string().trim().max(12).nullable().optional(),
});

export type InvoiceLine = z.infer<typeof invoiceLineSchema>;
export type InvoiceDocumentInput = z.input<typeof invoiceDocumentSchema>;
export type InvoiceDocument = z.infer<typeof invoiceDocumentSchema> & {
  subtotalCadCents: number;
};

export function parseInvoiceDocument(input: InvoiceDocumentInput): InvoiceDocument {
  const parsed = invoiceDocumentSchema.safeParse(input);
  if (!parsed.success) {
    throw new InvoiceValidationError(
      parsed.error.issues.map((issue) => issue.path.join(".") || "invalid"),
    );
  }

  const subtotalCadCents = parsed.data.items.reduce(
    (sum, item) => sum + item.unitAmountCadCents * item.quantity,
    0,
  );
  const discount = parsed.data.discountAmountCadCents ?? 0;
  const tax = parsed.data.taxAmountCadCents ?? 0;
  const shipping = parsed.data.shippingAmountCadCents ?? 0;
  const expected = subtotalCadCents - discount + tax + shipping;
  if (expected !== parsed.data.amountTotalCadCents) {
    throw new InvoiceValidationError(["amountTotalCadCents"]);
  }

  return { ...parsed.data, subtotalCadCents };
}

export function formatInvoiceMoney(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export function formatInvoiceDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
