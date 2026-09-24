import "server-only";
import type Stripe from "stripe";
import {
  getCatalogProduct,
  type CatalogProduct,
} from "@/lib/catalog/products";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import {
  getAppBaseUrl,
  isAdaptivePricingEnabled,
  paymentsCheckoutEnabled,
} from "./config";
import { getStripe } from "./client";

export type CreateCheckoutResult =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; error: string; status: number };

function buildLineItem(product: CatalogProduct): Stripe.Checkout.SessionCreateParams.LineItem {
  const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData =
    {
      name: product.nameEn,
      description: product.descriptionEn,
      metadata: {
        catalog_product_id: product.id,
        kind: product.kind,
      },
    };

  if (product.kind === "subscription") {
    if (!product.interval) {
      throw new Error(`Subscription product ${product.id} is missing interval.`);
    }

    return {
      quantity: 1,
      price_data: {
        currency: product.currency.toLowerCase(),
        unit_amount: product.amountCadCents,
        recurring: { interval: product.interval },
        product_data: productData,
      },
    };
  }

  // one_time
  return {
    quantity: 1,
    price_data: {
      currency: product.currency.toLowerCase(),
      unit_amount: product.amountCadCents,
      product_data: productData,
    },
  };
}

export async function createCheckoutSession(options: {
  productId: string;
  locale: string;
}): Promise<CreateCheckoutResult> {
  if (!paymentsCheckoutEnabled()) {
    return {
      ok: false,
      error: "Checkout is not enabled in this environment.",
      status: 403,
    };
  }

  const product = getCatalogProduct(options.productId);
  if (!product || !product.purchasable) {
    return { ok: false, error: "Product not found.", status: 404 };
  }

  const locale: Locale = isLocale(options.locale) ? options.locale : "en";
  const baseUrl = getAppBaseUrl();
  const stripe = getStripe();

  const mode: Stripe.Checkout.SessionCreateParams.Mode =
    product.kind === "subscription" ? "subscription" : "payment";

  const params: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: [buildLineItem(product)],
    success_url: `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/checkout/cancel?product=${encodeURIComponent(product.id)}`,
    billing_address_collection: "auto",
    // Email / contact collected on Stripe-hosted page (never store cards here)
    metadata: {
      catalog_product_id: product.id,
      product_kind: product.kind,
      locale,
      amount_cad_cents: String(product.amountCadCents),
    },
  };

  if (product.kind === "subscription") {
    params.subscription_data = {
      metadata: {
        catalog_product_id: product.id,
        locale,
      },
    };
  } else {
    params.payment_intent_data = {
      metadata: {
        catalog_product_id: product.id,
        locale,
      },
    };
  }

  if (isAdaptivePricingEnabled()) {
    params.adaptive_pricing = { enabled: true };
  }

  const session = await stripe.checkout.sessions.create(params);

  if (!session.url) {
    return {
      ok: false,
      error: "Stripe did not return a checkout URL.",
      status: 502,
    };
  }

  return { ok: true, url: session.url, sessionId: session.id };
}
