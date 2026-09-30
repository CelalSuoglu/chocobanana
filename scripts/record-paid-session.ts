/**
 * After a test Checkout payment succeeds, write the PAID order once
 * (useful when local webhook secret is not set yet).
 *
 *   npx tsx scripts/record-paid-session.ts cs_test_...
 */
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

async function main() {
  const sessionId = process.argv[2]?.trim();
  if (!sessionId?.startsWith("cs_")) {
    console.error("Usage: npx tsx scripts/record-paid-session.ts cs_test_...");
    process.exit(1);
  }

  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret?.startsWith("sk_test_")) {
    console.error("Need sk_test_ STRIPE_SECRET_KEY");
    process.exit(1);
  }

  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["total_details"],
  });

  if (session.payment_status !== "paid") {
    console.error("not_paid", session.payment_status);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const existing = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: session.id },
  });
  if (existing) {
    console.log("already_recorded", existing.id);
    await prisma.$disconnect();
    return;
  }

  let cart: { productId: string; quantity: number }[] = [];
  try {
    const raw = session.metadata?.cart_json;
    if (raw) cart = JSON.parse(raw) as typeof cart;
  } catch {
    cart = [];
  }
  if (cart.length === 0) {
    cart = [{ productId: "letter-sets", quantity: 1 }];
  }

  const catalog: Record<string, { name: string; cents: number }> = {
    "letter-sets": { name: "Letter Sets", cents: 1800 },
    "sticker-sheets": { name: "Sticker Sheets", cents: 1200 },
    "sealing-touches": { name: "Sealing Touches", cents: 2200 },
    "keepsake-notes": { name: "Keepsake Notes", cents: 1000 },
  };

  const email =
    session.customer_details?.email ||
    session.customer_email ||
    session.metadata?.customer_email ||
    "";
  if (!email) {
    console.error("missing_email");
    process.exit(1);
  }

  const ship =
    session.collected_information?.shipping_details ||
    (
      session as Stripe.Checkout.Session & {
        shipping_details?: Stripe.Checkout.Session.CollectedInformation.ShippingDetails | null;
      }
    ).shipping_details;

  const order = await prisma.order.create({
    data: {
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      paymentStatus: "PAID",
      fulfillmentStatus: "NEW",
      amountTotalCadCents: session.amount_total ?? 0,
      currency: (session.currency ?? "cad").toLowerCase(),
      shippingAmountCadCents: session.total_details?.amount_shipping ?? null,
      taxAmountCadCents: session.total_details?.amount_tax ?? null,
      customerEmail: email.toLowerCase(),
      customerName: session.customer_details?.name ?? null,
      customerPhone: session.customer_details?.phone ?? null,
      shippingName: ship?.name ?? null,
      shippingLine1: ship?.address?.line1 ?? null,
      shippingLine2: ship?.address?.line2 ?? null,
      shippingCity: ship?.address?.city ?? null,
      shippingState: ship?.address?.state ?? null,
      shippingPostalCode: ship?.address?.postal_code ?? null,
      shippingCountry: ship?.address?.country ?? null,
      locale: session.metadata?.locale ?? "en",
      stripeEventIds: [`manual_record_${session.id}`],
      items: {
        create: cart.map((line) => {
          const product = catalog[line.productId] ?? {
            name: line.productId,
            cents: 0,
          };
          return {
            catalogProductId: line.productId,
            name: product.name,
            quantity: line.quantity,
            unitAmountCadCents: product.cents,
            currency: "cad",
          };
        }),
      },
    },
  });

  console.log("order_id=" + order.id);
  console.log("owner_orders=/owner/orders");
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
