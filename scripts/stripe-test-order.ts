/**
 * Local Stripe test helpers (never prints secret values).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-test-order.ts create
 *   STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_... \
 *     npx tsx scripts/stripe-test-order.ts record --session cs_test_...
 *
 * `create` opens a Checkout Session URL for a one-time shop item (CAD).
 * Pay with card 4242… in the browser, forward webhooks with Stripe CLI, then
 * confirm Owner → Orders. `record` re-runs the paid-order writer for a session
 * that Stripe already marks paid (idempotent).
 */
import { createPaidOrderFromCheckoutSession } from "../lib/orders/repository";
import { createCheckoutSession } from "../lib/stripe/checkout";
import { getStripe } from "../lib/stripe/client";
import { getPaymentsMode } from "../lib/stripe/config";

async function main() {
  const [, , cmd, ...rest] = process.argv;
  const mode = getPaymentsMode();
  if (mode === "disabled") {
    console.error(
      "Payments disabled: set STRIPE_SECRET_KEY to a sk_test_… key (live keys stay off).",
    );
    process.exit(1);
  }
  if (mode === "live") {
    console.error("Refusing to run against live Stripe keys.");
    process.exit(1);
  }

  if (cmd === "create") {
    const result = await createCheckoutSession({
      locale: "en",
      productId: "letter-sets",
      customerEmail: "test+checkout@thechocobananaclub.com",
    });
    if (!result.ok) {
      console.error("create_failed", result.error);
      process.exit(1);
    }
    console.log("checkout_session_id=", result.sessionId);
    console.log("checkout_url=", result.url);
    console.log(
      "Pay with test card 4242… then ensure webhook → Owner Orders. Do not treat redirect alone as paid.",
    );
    return;
  }

  if (cmd === "record") {
    const idx = rest.indexOf("--session");
    const sessionId = idx >= 0 ? rest[idx + 1] : undefined;
    if (!sessionId) {
      console.error("Usage: record --session cs_test_...");
      process.exit(1);
    }
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "total_details"],
    });
    if (session.payment_status !== "paid") {
      console.error(
        "session_not_paid",
        session.payment_status,
        "— refusing to write Owner order",
      );
      process.exit(1);
    }
    const written = await createPaidOrderFromCheckoutSession({
      eventId: `manual_record_${sessionId}`,
      session,
    });
    console.log("order_created=", written.created, "order_id=", written.orderId);
    return;
  }

  console.error("Commands: create | record --session cs_test_...");
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
