/**
 * Print payment env readiness without revealing secret values.
 * Usage: npx tsx scripts/check-payments-env.ts
 */
import {
  getPaymentsMode,
  isAdaptivePricingEnabled,
  isAutomaticTaxEnabled,
  mailClubCheckoutEnabled,
  paymentsCheckoutEnabled,
} from "../lib/stripe/config";

function flag(name: string, value: string | undefined) {
  const v = value?.trim() ?? "";
  if (!v) return `${name}: MISSING`;
  if (name.includes("KEY") || name.includes("SECRET")) {
    const kind = v.startsWith("sk_test")
      ? "sk_test"
      : v.startsWith("sk_live")
        ? "sk_live"
        : v.startsWith("pk_test")
          ? "pk_test"
          : v.startsWith("pk_live")
            ? "pk_live"
            : v.startsWith("whsec_")
              ? "whsec"
              : "set";
    return `${name}: SET (${kind}, len=${v.length})`;
  }
  return `${name}: ${v}`;
}

console.log(flag("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY));
console.log(
  flag(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  ),
);
console.log(flag("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET));
console.log(flag("DATABASE_URL", process.env.DATABASE_URL ? "set" : ""));
console.log(flag("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL));
console.log("paymentsMode=", getPaymentsMode());
console.log("paymentsCheckoutEnabled=", paymentsCheckoutEnabled());
console.log("mailClubCheckoutEnabled=", mailClubCheckoutEnabled());
console.log("adaptivePricing=", isAdaptivePricingEnabled());
console.log("automaticTax=", isAutomaticTaxEnabled());

if (!paymentsCheckoutEnabled()) {
  console.log(
    "\nNext: add sk_test_… / pk_test_… / whsec_… to .env.local, restart next, then:",
  );
  console.log("  stripe listen --forward-to localhost:3000/api/webhooks/stripe");
  console.log("  Shop → Cart → Checkout (test card 4242…)");
  process.exitCode = 1;
} else {
  console.log("\nCheckout is enabled for this environment.");
}
