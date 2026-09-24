import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  createPaidOrderFromCheckoutSession,
  hasProcessedStripeEvent,
  markStripeEventProcessed,
} from "@/lib/orders/repository";
import { isDatabaseConfigured } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";
import { getPaymentsMode } from "@/lib/stripe/config";

export const runtime = "nodejs";

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
    console.error("webhook.signature_failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (await hasProcessedStripeEvent(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only persist after Stripe confirms payment — never on redirect alone.
      if (session.payment_status !== "paid") {
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

      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items", "total_details"],
      });

      if (full.payment_status !== "paid") {
        await markStripeEventProcessed(event.id);
        return NextResponse.json({ received: true, ignored: "not_paid" });
      }

      await createPaidOrderFromCheckoutSession({
        eventId: event.id,
        session: full,
      });
    }

    await markStripeEventProcessed(event.id);
  } catch (error) {
    console.error("webhook.handler_failed", event.id, error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
