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

export type CheckoutItemInput = {
  productId: string;
  quantity: number;
};

function buildLineItem(
  product: CatalogProduct,
  quantity: number,
): Stripe.Checkout.SessionCreateParams.LineItem {
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
      quantity,
      price_data: {
        currency: product.currency.toLowerCase(),
        unit_amount: product.amountCadCents,
        recurring: { interval: product.interval },
        product_data: productData,
      },
    };
  }

  return {
    quantity,
    price_data: {
      currency: product.currency.toLowerCase(),
      unit_amount: product.amountCadCents,
      product_data: productData,
    },
  };
}

function resolveItems(
  options: {
    productId?: string;
    items?: CheckoutItemInput[];
  },
): CheckoutItemInput[] | { error: string; status: number } {
  if (options.items && options.items.length > 0) {
    const cleaned = options.items
      .map((item) => ({
        productId: item.productId.trim(),
        quantity: Math.min(99, Math.max(0, Math.floor(item.quantity))),
      }))
      .filter((item) => item.productId && item.quantity > 0);

    if (cleaned.length === 0) {
      return { error: "Cart is empty.", status: 400 };
    }
    return cleaned;
  }

  if (options.productId) {
    return [{ productId: options.productId, quantity: 1 }];
  }

  return { error: "No products provided.", status: 400 };
}

export async function createCheckoutSession(options: {
  locale: string;
  productId?: string;
  items?: CheckoutItemInput[];
}): Promise<CreateCheckoutResult> {
  if (!paymentsCheckoutEnabled()) {
    return {
      ok: false,
      error: "Checkout is not enabled in this environment.",
      status: 403,
    };
  }

  const resolved = resolveItems(options);
  if ("error" in resolved) {
    return { ok: false, error: resolved.error, status: resolved.status };
  }

  const lineProducts: { product: CatalogProduct; quantity: number }[] = [];
  for (const item of resolved) {
    const product = getCatalogProduct(item.productId);
    if (!product || !product.purchasable) {
      return { ok: false, error: "Product not found.", status: 404 };
    }
    lineProducts.push({ product, quantity: item.quantity });
  }

  const kinds = new Set(lineProducts.map((entry) => entry.product.kind));
  if (kinds.size > 1) {
    return {
      ok: false,
      error: "Cart cannot mix one-time and subscription products.",
      status: 400,
    };
  }

  const kind = lineProducts[0]?.product.kind ?? "one_time";
  if (kind === "subscription" && lineProducts.length > 1) {
    return {
      ok: false,
      error: "Only one subscription product can be checked out at a time.",
      status: 400,
    };
  }

  if (kind === "one_time") {
    const ineligible = lineProducts.find(
      (entry) => !entry.product.cartEligible && resolved.length > 1,
    );
    // single legacy productId checkout still allowed for any purchasable one_time
    void ineligible;
  }

  const locale: Locale = isLocale(options.locale) ? options.locale : "en";
  const baseUrl = getAppBaseUrl();
  const stripe = getStripe();

  const mode: Stripe.Checkout.SessionCreateParams.Mode =
    kind === "subscription" ? "subscription" : "payment";

  const totalCadCents = lineProducts.reduce(
    (sum, entry) => sum + entry.product.amountCadCents * entry.quantity,
    0,
  );

  const params: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: lineProducts.map((entry) =>
      buildLineItem(entry.product, entry.quantity),
    ),
    success_url: `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/cart`,
    billing_address_collection: "auto",
    metadata: {
      product_kind: kind,
      locale,
      amount_cad_cents: String(totalCadCents),
      cart_product_ids: lineProducts.map((e) => e.product.id).join(","),
    },
  };

  if (kind === "subscription") {
    const only = lineProducts[0]!.product;
    params.subscription_data = {
      metadata: {
        catalog_product_id: only.id,
        locale,
      },
    };
  } else {
    params.payment_intent_data = {
      metadata: {
        locale,
        cart_product_ids: lineProducts.map((e) => e.product.id).join(","),
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
