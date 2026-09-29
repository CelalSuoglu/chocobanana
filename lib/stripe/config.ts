export type PaymentsMode = "disabled" | "test" | "live";

type StripeKeyMode = "test" | "live" | "missing" | "unknown";

/** Prefix only. Never log or return the key itself. */
export function stripeKeyMode(value: string | undefined): StripeKeyMode {
  const key = value?.trim() ?? "";
  if (!key) return "missing";
  if (
    key.startsWith("sk_test_") ||
    key.startsWith("rk_test_") ||
    key.startsWith("pk_test_")
  ) {
    return "test";
  }
  if (
    key.startsWith("sk_live_") ||
    key.startsWith("rk_live_") ||
    key.startsWith("pk_live_")
  ) {
    return "live";
  }
  return "unknown";
}

function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/**
 * Production accepts a live key only when PAYMENTS_LIVE_ENABLED=true,
 * the publishable key is also live, and the webhook secret is set.
 * A test key on Production stays disabled so the public site cannot
 * open a Sandbox Checkout Session.
 * Preview and local development accept test keys only.
 */
export function getPaymentsMode(): PaymentsMode {
  const secretMode = stripeKeyMode(process.env.STRIPE_SECRET_KEY);
  const publishableMode = stripeKeyMode(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
  const liveFlag = process.env.PAYMENTS_LIVE_ENABLED === "true";
  const webhookSet = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());

  if (secretMode === "missing" || secretMode === "unknown") return "disabled";
  if (publishableMode !== "missing" && publishableMode !== secretMode) {
    return "disabled";
  }

  if (isVercelProduction()) {
    if (secretMode !== "live" || publishableMode !== "live") return "disabled";
    if (!liveFlag || !webhookSet) return "disabled";
    return "live";
  }

  if (secretMode !== "test") return "disabled";
  return "test";
}

export function paymentsCheckoutEnabled(): boolean {
  // Stripe alone is not enough — paid orders require Postgres persistence.
  if (!process.env.DATABASE_URL?.trim()) return false;
  return getPaymentsMode() !== "disabled";
}

/**
 * Mail Club Join CTA / subscription checkout.
 * Requires PAYMENTS test mode (or explicitly enabled live) AND
 * MAIL_CLUB_CHECKOUT_ENABLED=true. Default stays closed.
 */
export function mailClubCheckoutEnabled(): boolean {
  if (process.env.MAIL_CLUB_CHECKOUT_ENABLED !== "true") return false;
  return paymentsCheckoutEnabled() && getPaymentsMode() === "test";
}

/** Checkout sessions always disable Adaptive Pricing so the charge stays CAD. */
export function isAdaptivePricingEnabled(): boolean {
  return false;
}

/** Stripe Tax — only when enabled in Dashboard and this flag is true. */
export function isAutomaticTaxEnabled(): boolean {
  return process.env.STRIPE_AUTOMATIC_TAX === "true";
}

export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
