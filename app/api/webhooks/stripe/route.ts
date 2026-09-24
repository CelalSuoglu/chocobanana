import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getOrderStore } from "@/lib/orders/store";
import { isComingSoonEnabled } from "@/lib/site-access";
import { getStripe } from "@/lib/stripe/client";
import { getPaymentsMode } from "@/lib/stripe/config";

export const runtime = "nodejs";

function asId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id: unknown }).id === "string"
  ) {
    return (value as { id: string }).id;
  }
  return null;
}

export async function POST(request: Request) {
  if (isComingSoonEnabled()) {
    return NextResponse.json(
      { error: "Webhooks unavailable while coming soon is active." },
      { status: 503 },
    );
  }

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

  const store = getOrderStore();

  if (await store.hasProcessedEvent(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Prefer API retrieve for presentment_details freshness
      const full = await stripe.checkout.sessions.retrieve(session.id);

      await store.upsertFromCheckoutSession({
        eventId: event.id,
        session: {
          id: full.id,
          payment_intent: asId(full.payment_intent),
          subscription: asId(full.subscription),
          customer: asId(full.customer),
          customer_email: full.customer_email,
          customer_details: full.customer_details
            ? {
                email: full.customer_details.email,
                name: full.customer_details.name,
              }
            : null,
          amount_total: full.amount_total,
          currency: full.currency,
          metadata: (full.metadata ?? null) as Record<string, string> | null,
          presentment_details: full.presentment_details
            ? {
                presentment_amount:
                  full.presentment_details.presentment_amount ?? null,
                presentment_currency:
                  full.presentment_details.presentment_currency ?? null,
              }
            : null,
          mode: full.mode,
        },
      });
    }

    // Mark processed after successful handling so retries re-run on failure
    await store.markEventProcessed(event.id);
  } catch (error) {
    console.error("webhook.handler_failed", event.id, error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
