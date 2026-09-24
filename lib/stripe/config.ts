export type PaymentsMode = "disabled" | "test" | "live";

/**
 * Live checkout buttons stay off unless a live secret key is present
 * AND PAYMENTS_LIVE_ENABLED=true. Test keys (sk_test_*) enable buttons
 * for end-to-end sandbox trials.
 */
export function getPaymentsMode(): PaymentsMode {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) return "disabled";

  if (secret.startsWith("sk_test_")) {
    return "test";
  }

  if (
    secret.startsWith("sk_live_") &&
    process.env.PAYMENTS_LIVE_ENABLED === "true"
  ) {
    return "live";
  }

  return "disabled";
}

export function paymentsCheckoutEnabled(): boolean {
  return getPaymentsMode() !== "disabled";
}

export function isAdaptivePricingEnabled(): boolean {
  return process.env.STRIPE_ADAPTIVE_PRICING === "true";
}

export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
