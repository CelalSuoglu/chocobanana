import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import {
  createPaidOrderFromCheckoutSession,
  createPaidOrderFromInvoice,
  hasProcessedStripeEvent,
  markStripeEventProcessed,
} from "@/lib/orders/repository";
import { getStripe } from "@/lib/stripe/client";
import { getPaymentsMode } from "@/lib/stripe/config";
import { upsertMailClubSubscription } from "@/lib/subscriptions/repository";
import {
  applyFullRefundFromCharge,
  releaseRewardIfCheckoutClosed,
  settleRewardAfterPaidCheckout,
} from "@/lib/rewards/settle";

export const runtime = "nodejs";

function customerIdFrom(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  if ("deleted" in customer && customer.deleted) return null;
  return customer.id;
}

async function resolveUserId(options: {
  metadataUserId?: string | null;
  email?: string | null;
  stripeCustomerId?: string | null;
}): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  const prisma = requirePrisma();
  if (options.metadataUserId) {
    const byId = await prisma.user.findUnique({
      where: { id: options.metadataUserId },
      select: { id: true },
    });
    if (byId) return byId.id;
  }
  if (options.stripeCustomerId) {
    const byCustomer = await prisma.user.findUnique({
      where: { stripeCustomerId: options.stripeCustomerId },
      select: { id: true },
    });
    if (byCustomer) return byCustomer.id;
  }
  if (options.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: options.email.toLowerCase() },
      select: { id: true },
    });
    if (byEmail) return byEmail.id;
  }
  return null;
}

async function attachStripeCustomerToUser(
  userId: string,
  stripeCustomerId: string,
) {
  if (!isDatabaseConfigured()) return;
  const prisma = requirePrisma();
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId },
  });
}

function periodEndFromSubscription(sub: Stripe.Subscription): Date | null {
  const end = (
    sub as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;
  if (typeof end === "number") return new Date(end * 1000);
  return null;
}

async function recordPaidCheckoutSession(
  eventId: string,
  sessionId: string,
): Promise<{ ignored?: string; orderId?: string }> {
  const stripe = getStripe();
  const full = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: [
      "line_items",
      "total_details.breakdown.discounts.discount.promotion_code",
      "subscription",
    ],
  });

  if (full.payment_status !== "paid") {
    return { ignored: "not_paid" };
  }

  const orderResult = await createPaidOrderFromCheckoutSession({
    eventId,
    session: full,
  });

  const stripeCustomerId = customerIdFrom(full.customer);
  const metadata = (full.metadata ?? {}) as Record<string, string>;
  const userId = await resolveUserId({
    metadataUserId: metadata.user_id || full.client_reference_id,
    email:
      full.customer_details?.email ||
      full.customer_email ||
      metadata.customer_email,
    stripeCustomerId,
  });

  if (userId && stripeCustomerId) {
    await attachStripeCustomerToUser(userId, stripeCustomerId);
  }

  if (orderResult.orderId) {
    await settleRewardAfterPaidCheckout({
      session: full,
      orderId: orderResult.orderId,
      userId,
    });
  }

  if (full.mode === "subscription" && userId && stripeCustomerId) {
    const subId =
      typeof full.subscription === "string"
        ? full.subscription
        : full.subscription?.id;
    if (subId) {
      const sub = await stripe.subscriptions.retrieve(subId);
      await upsertMailClubSubscription({
        userId,
        stripeCustomerId,
        stripeSubscriptionId: sub.id,
        status: sub.status,
        currentPeriodEnd: periodEndFromSubscription(sub),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      });
      if (orderResult.orderId) {
        await requirePrisma().order.update({
          where: { id: orderResult.orderId },
          data: {
            stripeSubscriptionId: sub.id,
            billingReason: "subscription_create",
          },
        });
      }
    }
  }

  return { orderId: orderResult.orderId };
}

export async function POST(request: Request) {
  if (getPaymentsMode() === "disabled") {
    return NextResponse.json({ error: "Payments disabled." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error(
      "webhook.signature_failed",
      error instanceof Error ? error.message : "invalid_signature",
    );
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const mode = getPaymentsMode();
  if (mode === "live" && !event.livemode) {
    console.error("webhook.rejected_test_event");
    return NextResponse.json({ error: "Test event rejected." }, { status: 400 });
  }
  if (mode === "test" && event.livemode) {
    console.error("webhook.rejected_live_event");
    return NextResponse.json({ error: "Live event rejected." }, { status: 400 });
  }

  if (await hasProcessedStripeEvent(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        await releaseRewardIfCheckoutClosed({ checkoutSessionId: session.id });
        await markStripeEventProcessed(event.id);
        return NextResponse.json({ received: true, ignored: "not_paid" });
      }

      if (!isDatabaseConfigured()) {
        console.warn("webhook.order_skipped_no_database", session.id);
        await markStripeEventProcessed(event.id);
        return NextResponse.json({
          received: true,
          skipped: "database_not_configured",
        });
      }

      const result = await recordPaidCheckoutSession(event.id, session.id);
      if (result.ignored) {
        await markStripeEventProcessed(event.id);
        return NextResponse.json({ received: true, ignored: result.ignored });
      }
    }

    if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      await releaseRewardIfCheckoutClosed({ checkoutSessionId: session.id });
      await markStripeEventProcessed(event.id);
      return NextResponse.json({ received: true, ignored: "not_paid" });
    }

    if (
      event.type === "payment_intent.payment_failed" ||
      event.type === "payment_intent.canceled"
    ) {
      const intent = event.data.object as Stripe.PaymentIntent;
      await releaseRewardIfCheckoutClosed({
        rewardCodeId: intent.metadata?.reward_code_id,
      });
      await markStripeEventProcessed(event.id);
      return NextResponse.json({ received: true, ignored: "not_paid" });
    }

    if (event.type === "charge.refunded") {
      if (!isDatabaseConfigured()) {
        await markStripeEventProcessed(event.id);
        return NextResponse.json({
          received: true,
          skipped: "database_not_configured",
        });
      }
      await applyFullRefundFromCharge(event.data.object as Stripe.Charge);
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      if (!isDatabaseConfigured()) {
        await markStripeEventProcessed(event.id);
        return NextResponse.json({
          received: true,
          skipped: "database_not_configured",
        });
      }
      const stripeCustomerId = customerIdFrom(sub.customer);
      const metadata = (sub.metadata ?? {}) as Record<string, string>;
      const userId = await resolveUserId({
        metadataUserId: metadata.user_id,
        stripeCustomerId,
      });
      if (userId && stripeCustomerId) {
        await upsertMailClubSubscription({
          userId,
          stripeCustomerId,
          stripeSubscriptionId: sub.id,
          status:
            event.type === "customer.subscription.deleted"
              ? "canceled"
              : sub.status,
          currentPeriodEnd: periodEndFromSubscription(sub),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      if (!isDatabaseConfigured()) {
        await markStripeEventProcessed(event.id);
        return NextResponse.json({
          received: true,
          skipped: "database_not_configured",
        });
      }

      const billingReason = invoice.billing_reason;
      if (billingReason === "subscription_create") {
        await markStripeEventProcessed(event.id);
        return NextResponse.json({ received: true, ignored: "initial_invoice" });
      }

      if (
        billingReason === "subscription_cycle" ||
        billingReason === "subscription_update"
      ) {
        await createPaidOrderFromInvoice({
          eventId: event.id,
          invoice,
        });
      }
    }

    await markStripeEventProcessed(event.id);
  } catch (error) {
    console.error("webhook.handler_failed", event.id, error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
