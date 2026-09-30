import "server-only";
import type Stripe from "stripe";
import type { FulfillmentStatus, Prisma } from "@prisma/client";
import { getCatalogProduct } from "@/lib/catalog/products";
import {
  snailMailPriceCadCents,
  snailMailRegionForCountry,
} from "@/lib/catalog/snail-mail";
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
  let hasSnailMail = false;
  for (const line of cart) {
    const product = getCatalogProduct(line.productId);
    if (!product) {
      throw new Error(
        `Unknown catalog product ${line.productId} for session ${session.id}`,
      );
    }
    if (product.snailMail) {
      const expected = snailMailPriceCadCents(
        product.snailMail.region,
        product.snailMail.termMonths,
      );
      if (product.amountCadCents !== expected) {
        throw new Error(
          `Mail Club price for ${product.id} does not match the price table.`,
        );
      }
      hasSnailMail = true;
    }
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

  const metadataUserId = metadata.user_id?.trim() || null;
  const userById = metadataUserId
    ? await prisma.user.findUnique({ where: { id: metadataUserId } })
    : null;
  const user =
    userById ??
    (await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    }));

  const shippingFromStripe = shippingFromSession(session);
  const totalDetails = session.total_details;
  const shippingAmountCadCents = totalDetails?.amount_shipping ?? null;
  const taxAmountCadCents = totalDetails?.amount_tax ?? null;

  if ((session.currency ?? "cad").toLowerCase() !== "cad") {
    throw new Error(`Session ${session.id} is not charged in CAD.`);
  }

  const expectedSubtotal = itemsData.reduce(
    (sum, item) => sum + item.unitAmountCadCents * item.quantity,
    0,
  );
  if (
    session.amount_subtotal != null &&
    session.amount_subtotal !== expectedSubtotal
  ) {
    throw new Error(
      `Session ${session.id} subtotal does not match the catalog price.`,
    );
  }

  if (hasSnailMail) {
    if ((shippingAmountCadCents ?? 0) > 0) {
      throw new Error(
        `Session ${session.id} adds a shipping fee to a Mail Club package.`,
      );
    }
    const region = snailMailRegionForCountry(shippingFromStripe.shippingCountry);
    if (!region) {
      throw new Error(
        `Session ${session.id} shipping country is outside Mail Club regions.`,
      );
    }
    for (const line of cart) {
      const product = getCatalogProduct(line.productId);
      if (product?.snailMail && product.snailMail.region !== region) {
        throw new Error(
          `Session ${session.id} shipping country does not match the Mail Club region.`,
        );
      }
    }
  }

  // Snapshot: prefer Stripe shipping, else freeze the customer's profile address at purchase time.
  const shipping = {
    shippingName:
      shippingFromStripe.shippingName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.name ||
      null,
    shippingLine1: shippingFromStripe.shippingLine1 || user?.addressLine1 || null,
    shippingLine2: shippingFromStripe.shippingLine2 || user?.addressLine2 || null,
    shippingCity: shippingFromStripe.shippingCity || user?.city || null,
    shippingState: shippingFromStripe.shippingState || user?.region || null,
    shippingPostalCode:
      shippingFromStripe.shippingPostalCode || user?.postalCode || null,
    shippingCountry: shippingFromStripe.shippingCountry || user?.country || null,
  };
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const customerName =
    session.customer_details?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    null;

  const order = await prisma.order.create({
    data: {
      userId: user?.id ?? null,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntent,
      stripeSubscriptionId: subscriptionId,
      billingReason: subscriptionId ? "subscription_create" : null,
      stripeEventIds: [eventId],
      paymentStatus: "PAID",
      fulfillmentStatus: "NEW",
      amountTotalCadCents: session.amount_total ?? 0,
      currency: (session.currency ?? "cad").toLowerCase(),
      shippingAmountCadCents,
      taxAmountCadCents,
      discountAmountCadCents:
        totalDetails?.amount_discount && totalDetails.amount_discount > 0
          ? totalDetails.amount_discount
          : null,
      presentmentAmountCents:
        session.presentment_details?.presentment_amount ?? null,
      presentmentCurrency:
        session.presentment_details?.presentment_currency?.toLowerCase() ??
        null,
      customerEmail: email.toLowerCase(),
      customerName,
      customerPhone:
        session.customer_details?.phone ?? user?.phone ?? null,
      ...shipping,
      locale: metadata.locale ?? null,
      items: { create: itemsData },
    },
  });

  return { created: true, orderId: order.id };
}

export async function createPaidOrderFromInvoice(options: {
  eventId: string;
  invoice: Stripe.Invoice;
}): Promise<{ created: boolean; orderId?: string }> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is required to persist orders.");
  }

  const prisma = requirePrisma();
  const { eventId, invoice } = options;

  if (!invoice.id) {
    throw new Error("Invoice missing id");
  }

  const existingByInvoice = await prisma.order.findUnique({
    where: { stripeInvoiceId: invoice.id },
  });
  if (existingByInvoice) {
    if (!existingByInvoice.stripeEventIds.includes(eventId)) {
      await prisma.order.update({
        where: { id: existingByInvoice.id },
        data: { stripeEventIds: { push: eventId } },
      });
    }
    return { created: false, orderId: existingByInvoice.id };
  }

  const rawSubscription = (
    invoice as Stripe.Invoice & {
      subscription?: string | { id: string } | null;
    }
  ).subscription;
  const subscriptionId =
    typeof rawSubscription === "string"
      ? rawSubscription
      : rawSubscription && typeof rawSubscription === "object"
        ? rawSubscription.id
        : null;

  const stripeCustomerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer &&
          typeof invoice.customer === "object" &&
          "id" in invoice.customer
        ? invoice.customer.id
        : null;

  const email =
    invoice.customer_email ||
    (typeof invoice.customer === "object" &&
    invoice.customer &&
    "email" in invoice.customer
      ? (invoice.customer.email as string | null)
      : null) ||
    "";

  let user =
    (stripeCustomerId
      ? await prisma.user.findUnique({
          where: { stripeCustomerId },
        })
      : null) ??
    (email
      ? await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        })
      : null);

  if (!user && subscriptionId) {
    const sub = await prisma.mailClubSubscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      include: { user: true },
    });
    user = sub?.user ?? null;
  }

  const catalogId = invoice.lines?.data?.[0]?.metadata?.catalog_product_id;
  if (!catalogId) {
    throw new Error(
      `Invoice ${invoice.id} has no catalog_product_id; refusing to invent a subscription product or price.`,
    );
  }
  const product = getCatalogProduct(catalogId);
  if (!product || product.kind !== "subscription") {
    throw new Error(
      `Invoice ${invoice.id} catalog product is not a known subscription.`,
    );
  }

  if (invoice.amount_paid == null) {
    throw new Error(`Invoice ${invoice.id} has no amount_paid.`);
  }

  const customerEmail = (email || user?.email || "").toLowerCase();
  if (!customerEmail) {
    throw new Error(`Missing customer email for invoice ${invoice.id}`);
  }

  // Synthetic session id for unique constraint — invoice renewals have no checkout session.
  const syntheticSessionId = `invoice_${invoice.id}`;

  const order = await prisma.order.create({
    data: {
      userId: user?.id ?? null,
      stripeCheckoutSessionId: syntheticSessionId,
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId: subscriptionId,
      billingReason: invoice.billing_reason ?? "subscription_cycle",
      stripeEventIds: [eventId],
      paymentStatus: "PAID",
      fulfillmentStatus: "NEW",
      amountTotalCadCents: invoice.amount_paid,
      currency: (invoice.currency ?? "cad").toLowerCase(),
      customerEmail,
      customerName:
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        user?.name ||
        null,
      customerPhone: user?.phone ?? null,
      shippingName:
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        user?.name ||
        null,
      shippingLine1: user?.addressLine1 ?? null,
      shippingLine2: user?.addressLine2 ?? null,
      shippingCity: user?.city ?? null,
      shippingState: user?.region ?? null,
      shippingPostalCode: user?.postalCode ?? null,
      shippingCountry: user?.country ?? null,
      locale: user?.preferredLocale ?? null,
      items: {
        create: [
          {
            catalogProductId: product.id,
            name: product.nameEn,
            quantity: 1,
            unitAmountCadCents: product.amountCadCents,
            currency: product.currency.toLowerCase(),
          },
        ],
      },
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

export async function listOwnerCustomers(filters: { q?: string } = {}) {
  const prisma = requirePrisma();
  const q = filters.q?.trim();
  return prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
      emailVerified: true,
      preferredLocale: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

/** Separate counters for the owner dashboard (not mixed into one list). */
export async function getOwnerDashboardStats() {
  const prisma = requirePrisma();
  const dayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    memberTotal,
    membersNew,
    activeSubscribers,
    orderTotal,
    ordersNew,
    ordersPreparing,
    fulfillmentThisMonth,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: dayAgo } },
    }),
    prisma.mailClubSubscription.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.order.count({
      where: { paymentStatus: "PAID", createdAt: { gte: dayAgo } },
    }),
    prisma.order.count({
      where: {
        paymentStatus: "PAID",
        fulfillmentStatus: { in: ["NEW", "PREPARING"] },
      },
    }),
    prisma.order.count({
      where: {
        paymentStatus: "PAID",
        fulfillmentStatus: { in: ["NEW", "PREPARING"] },
        createdAt: { gte: monthStart },
      },
    }),
  ]);
  return {
    memberTotal,
    membersNew,
    activeSubscribers,
    orderTotal,
    ordersNew,
    ordersPreparing,
    fulfillmentThisMonth,
  };
}

export async function listFulfillmentRows(options: {
  year: number;
  month: number;
}) {
  const prisma = requirePrisma();
  const start = new Date(options.year, options.month - 1, 1);
  const end = new Date(options.year, options.month, 1);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "PAID",
      fulfillmentStatus: { in: ["NEW", "PREPARING"] },
      createdAt: { gte: start, lt: end },
    },
    include: { items: true, user: true },
    orderBy: { createdAt: "asc" },
  });

  const activeSubs = await prisma.mailClubSubscription.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: true,
    },
  });

  return { orders, activeSubs };
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
