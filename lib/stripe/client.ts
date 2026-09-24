import "server-only";
import Stripe from "stripe";
import { getPaymentsMode } from "./config";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const mode = getPaymentsMode();
  if (mode === "disabled") {
    throw new Error("Stripe is not enabled in this environment.");
  }

  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secret, {
      // Pin to account default API version from the installed SDK
      typescript: true,
    });
  }

  return stripeClient;
}
