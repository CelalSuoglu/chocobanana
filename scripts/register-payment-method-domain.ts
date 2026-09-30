/**
 * Register the storefront domain for Apple Pay / Google Pay (Payment Element / custom UIs).
 * Stripe-hosted Checkout already shows wallets when enabled in the Dashboard; this helps
 * if you later embed payment UI on your own domain.
 *
 * Usage (test key only):
 *   npx tsx scripts/register-payment-method-domain.ts thechocobananaclub.com
 */
import { getStripe } from "../lib/stripe/client";
import { getPaymentsMode } from "../lib/stripe/config";

async function main() {
  const domain = process.argv[2]?.trim();
  if (!domain) {
    console.error("Usage: npx tsx scripts/register-payment-method-domain.ts example.com");
    process.exit(1);
  }

  if (getPaymentsMode() !== "test") {
    console.error("Refusing: use sk_test_… only for this script.");
    process.exit(1);
  }

  const stripe = getStripe();
  const existing = await stripe.paymentMethodDomains.list({ limit: 100 });
  const found = existing.data.find((d) => d.domain_name === domain);
  if (found) {
    console.log("already_registered", found.id, "apple_pay=", found.apple_pay?.status);
    return;
  }

  const created = await stripe.paymentMethodDomains.create({ domain_name: domain });
  console.log(
    "registered",
    created.id,
    "apple_pay=",
    created.apple_pay?.status,
    "google_pay=",
    created.google_pay?.status,
  );
  console.log(
    "If Apple Pay needs a domain file, download it from Stripe Dashboard → Settings → Payment methods → Apple Pay and place it at public/.well-known/apple-developer-merchantid-domain-association",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
