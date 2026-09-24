import "server-only";
import type Stripe from "stripe";
import type { FulfillmentStatus, Prisma } from "@prisma/client";
import { getCatalogProduct } from "@/lib/catalog/products";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";

export function parseCartMetadata(
  metadata: Record<string, string> | null | undefined,
): { productId: string; quantity: number }[] {
  if (!metadata?.cart_json) return [];
  try {
    const parsed = JSON.parse(metadata.cart_json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const productId = (entry as { productId?: unknown }).productId;
        const quantity = (entry as { quantity?: unknown }).quantity;
        if (typeof productId !== "string" || typeof quantity !== "number") {
          return null;
        }
        return {
          productId: productId.trim(),
          quantity: Math.min(99, Math.max(1, Math.floor(quantity))),
        };
      })
      .filter((entry): entry is { productId: string; quantity: number } =>
        Boolean(entry),
      );
  } catch {
    return [];
  }
}

type ShippingDetails = {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

function shippingFromSession(session: Stripe.Checkout.Session) {
  const collected = session.collected_information?.shipping_details as
    | ShippingDetails
    | null
    | undefined;
  const legacy = (session as Stripe.Checkout.Session & {
    shipping_details?: ShippingDetails | null;
  }).shipping_details;
  const details = collected ?? legacy ?? null;
  const address = details?.address;
  return {
    shippingName: details?.name ?? null,
    shippingLine1: address?.line1 ?? null,
    shippingLine2: address?.line2 ?? null,
    shippingCity: address?.city ?? null,
    shippingState: address?.state ?? null,
    shippingPostalCode: address?.postal_code ?? null,
    shippingCountry: address?.country ?? null,
  };
}

export async function hasProcessedStripeEvent(eventId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  const prisma = requirePrisma();
  const row = await prisma.processedStripeEvent.findUnique({
    where: { id: eventId },
  });
  return Boolean(row);
}

export async function markStripeEventProcessed(eventId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const prisma = requirePrisma();
  await prisma.processedStripeEvent.upsert({
    where: { id: eventId },
    create: { id: eventId },
    update: {},
  });
}

export async function createPaidOrderFromCheckoutSession(options: {
  eventId: string;
  session: Stripe.Checkout.Session;
}): Promise<{ created: boolean; orderId?: string }> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is required to persist orders.");
  }

  const prisma = requirePrisma();
  const { eventId, session } = options;

  const existing = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: session.id },
  });
  if (existing) {
    if (!existing.stripeEventIds.includes(eventId)) {
      await prisma.order.update({
        where: { id: existing.id },
        data: { stripeEventIds: { push: eventId } },
      });
    }
    return { created: false, orderId: existing.id };
  }

  const metadata = (session.metadata ?? {}) as Record<string, string>;
  let cart = parseCartMetadata(metadata);
  if (cart.length === 0 && metadata.catalog_product_id) {
    cart = [{ productId: metadata.catalog_product_id, quantity: 1 }];
  }

  const itemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
  for (const line of cart) {
    const product = getCatalogProduct(line.productId);
    if (!product) continue;
    itemsData.push({
      catalogProductId: product.id,
      name: product.nameEn,
      quantity: line.quantity,
      unitAmountCadCents: product.amountCadCents,
      currency: product.currency.toLowerCase(),
    });
  }

  if (itemsData.length === 0) {
    throw new Error(`No catalog items resolved for session ${session.id}`);
  }

  const email =
    session.customer_details?.email ||
    session.customer_email ||
    metadata.customer_email ||
    "";
  if (!email) {
    throw new Error(`Missing customer email for session ${session.id}`);
  }

  const userId = metadata.user_id || null;
  const user =
    userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

  const shipping = shippingFromSession(session);
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const order = await prisma.order.create({
    data: {
      userId: user?.id ?? null,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntent,
      stripeEventIds: [eventId],
      paymentStatus: "PAID",
      fulfillmentStatus: "NEW",
      amountTotalCadCents: session.amount_total ?? 0,
      currency: (session.currency ?? "cad").toLowerCase(),
      presentmentAmountCents:
        session.presentment_details?.presentment_amount ?? null,
      presentmentCurrency:
        session.presentment_details?.presentment_currency?.toLowerCase() ??
        null,
      customerEmail: email.toLowerCase(),
      customerName: session.customer_details?.name ?? null,
      ...shipping,
      locale: metadata.locale ?? null,
      items: { create: itemsData },
    },
  });

  return { created: true, orderId: order.id };
}

export async function listOrdersForUser(userId: string) {
  const prisma = requirePrisma();
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderForUser(orderId: string, userId: string) {
  const prisma = requirePrisma();
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
}

export async function listOwnerOrders(filters: {
  q?: string;
  status?: FulfillmentStatus | "ALL";
}) {
  const prisma = requirePrisma();
  const where: Prisma.OrderWhereInput = {
    paymentStatus: "PAID",
  };

  if (filters.status && filters.status !== "ALL") {
    where.fulfillmentStatus = filters.status;
  }

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { customerEmail: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
      { stripeCheckoutSessionId: { contains: q, mode: "insensitive" } },
    ];
  }

  return prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getOwnerOrder(orderId: string) {
  const prisma = requirePrisma();
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });
}

export async function updateFulfillmentStatus(
  orderId: string,
  status: FulfillmentStatus,
) {
  const prisma = requirePrisma();
  return prisma.order.update({
    where: { id: orderId },
    data: { fulfillmentStatus: status },
  });
}
