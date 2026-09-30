import Stripe from "stripe";

async function main() {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret?.startsWith("sk_test_")) {
    console.error("Need sk_test_ in STRIPE_SECRET_KEY");
    process.exit(1);
  }

  const stripe = new Stripe(secret);
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: 1800,
          product_data: {
            name: "Letter Sets",
            metadata: { catalog_product_id: "letter-sets", kind: "one_time" },
          },
        },
      },
    ],
    success_url: `${base}/en/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/en/cart`,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["CA", "US", "GB", "AU", "FR", "DE", "TR"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "cad" },
          display_name: "Shipping",
        },
      },
    ],
    metadata: {
      product_kind: "one_time",
      locale: "en",
      amount_cad_cents: "1800",
      cart_product_ids: "letter-sets",
      cart_json: JSON.stringify([{ productId: "letter-sets", quantity: 1 }]),
      user_id: "",
      customer_email: "test+checkout@thechocobananaclub.com",
    },
    customer_email: "test+checkout@thechocobananaclub.com",
  });

  console.log("session_id=" + session.id);
  console.log("checkout_url=" + session.url);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
