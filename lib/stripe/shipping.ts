import type Stripe from "stripe";

/**
 * Countries we will ship to via Stripe Checkout.
 * Do not offer Checkout shipping outside this list.
 */
export const CHECKOUT_SHIPPING_COUNTRIES = [
  "CA",
  "US",
  "GB",
  "AU",
  "FR",
  "DE",
  "TR",
] as const;

export type CheckoutShippingCountry =
  (typeof CHECKOUT_SHIPPING_COUNTRIES)[number];

export function isCheckoutShippingCountry(
  value: string,
): value is CheckoutShippingCountry {
  return (CHECKOUT_SHIPPING_COUNTRIES as readonly string[]).includes(
    value.toUpperCase(),
  );
}

/** Free shipping on hosted Checkout. Address is still collected; no fee is charged. */
export function getCheckoutShippingOptions(
  displayName = "Shipping",
): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: 0, currency: "cad" },
        display_name: displayName,
      },
    },
  ];
}
