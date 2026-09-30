import "server-only";
import type Stripe from "stripe";
import {
  getCatalogProduct,
  isRewardDiscountProduct,
  type CatalogProduct,
} from "@/lib/catalog/products";
import {
  countriesForSnailMailRegion,
  snailMailPriceCadCents,
  type SnailMailRegion,
} from "@/lib/catalog/snail-mail";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import {
  getAppBaseUrl,
  isAutomaticTaxEnabled,
  mailClubCheckoutEnabled,
  paymentsCheckoutEnabled,
} from "./config";
import { getStripe } from "./client";
import { ensureRewardCoupon, setRewardPromotionActive } from "./reward-coupon";
import {
  CHECKOUT_SHIPPING_COUNTRIES,
  getCheckoutShippingOptions,
} from "./shipping";
import {
  attachReservationSession,
  claimRewardCode,
  detachReservationSession,
  releaseRewardReservationById,
} from "@/lib/rewards/engine";

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
  // Catalog amounts are always CAD — never invent alternate charge currencies here.
  const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData =
    {
      name: product.nameEn,
      description: product.descriptionEn,
      metadata: {
        catalog_product_id: product.id,
        kind: product.kind,
        ...(product.snailMail
          ? {
              snail_mail_term: String(product.snailMail.termMonths),
              snail_mail_region: product.snailMail.region,
            }
          : {}),
      },
    };

  if (product.kind === "subscription") {
    if (!product.interval) {
      throw new Error(`Subscription product ${product.id} is missing interval.`);
    }

    return {
      quantity,
      price_data: {
        currency: "cad",
        unit_amount: product.amountCadCents,
        recurring: { interval: product.interval },
        product_data: productData,
      },
    };
  }

  return {
    quantity,
    price_data: {
      currency: "cad",
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
  userId?: string | null;
  customerEmail?: string | null;
  rewardCode?: string | null;
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
    if (product.snailMail) {
      const expected = snailMailPriceCadCents(
        product.snailMail.region,
        product.snailMail.termMonths,
      );
      if (product.amountCadCents !== expected) {
        return {
          ok: false,
          error: "Mail Club price does not match the price table.",
          status: 500,
        };
      }
    }
    if (options.items && product.kind === "subscription") {
      return {
        ok: false,
        error: "Subscription products cannot be purchased from the cart.",
        status: 400,
      };
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

  if (kind === "subscription" && !mailClubCheckoutEnabled()) {
    return {
      ok: false,
      error: "Mail Club checkout is not enabled in this environment.",
      status: 403,
    };
  }

  const snailRegions = new Set(
    lineProducts
      .map((entry) => entry.product.snailMail?.region)
      .filter((region): region is SnailMailRegion => Boolean(region)),
  );
  if (snailRegions.size > 1) {
    return {
      ok: false,
      error: "Mail Club packages in one checkout must use the same region.",
      status: 400,
    };
  }
  const snailRegion = [...snailRegions][0];
  const hasSticker = lineProducts.some((entry) => entry.product.family === "sticker");
  if (snailRegion && hasSticker) {
    return {
      ok: false,
      error:
        "Check out sticker sheets and Snail Mail Club packages separately. Club postage is already included and is not added again.",
      status: 400,
    };
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

  const cartJson = JSON.stringify(
    lineProducts.map((entry) => ({
      productId: entry.product.id,
      quantity: entry.quantity,
    })),
  );

  let stripeCustomerId: string | undefined;
  if (options.userId && isDatabaseConfigured()) {
    const db = requirePrisma();
    const user = await db.user.findUnique({
      where: { id: options.userId },
      select: { stripeCustomerId: true, email: true },
    });
    stripeCustomerId = user?.stripeCustomerId ?? undefined;
    if (!stripeCustomerId && user?.email) {
      const created = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: options.userId },
      });
      try {
        await db.user.update({
          where: { id: options.userId },
          data: { stripeCustomerId: created.id },
        });
        stripeCustomerId = created.id;
      } catch {
        const again = await db.user.findUnique({
          where: { id: options.userId },
          select: { stripeCustomerId: true },
        });
        stripeCustomerId = again?.stripeCustomerId ?? created.id;
      }
    }
  }

  // Do not set payment_method_types — Stripe Checkout shows Dashboard-enabled
  // methods (card / Apple Pay / Google Pay / Link) when eligible for that device.
  // Wallets are never guaranteed on every browser; Safari+Apple Pay / Chrome+Google Pay.
  const params: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: lineProducts.map((entry) =>
      buildLineItem(entry.product, entry.quantity),
    ),
    success_url: `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      kind === "subscription" || snailRegion
        ? `${baseUrl}/${locale}/snail-mail-club`
        : `${baseUrl}/${locale}/cart`,
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    shipping_address_collection: {
      allowed_countries: snailRegion
        ? (countriesForSnailMailRegion(
            snailRegion,
          ) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection["allowed_countries"])
        : [...CHECKOUT_SHIPPING_COUNTRIES],
    },
    // Postage is already inside a Mail Club package total. Do not add a second shipping line.
    ...(snailRegion
      ? {}
      : {
          shipping_options: getCheckoutShippingOptions(
            hasSticker ? "Sticker shipping" : "Shipping",
          ),
        }),
    client_reference_id: options.userId ?? undefined,
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : { customer_email: options.customerEmail ?? undefined }),
    metadata: {
      product_kind: kind,
      locale,
      amount_cad_cents: String(totalCadCents),
      ...(snailRegion ? { snail_mail_region: snailRegion } : {}),
      cart_product_ids: lineProducts.map((e) => e.product.id).join(","),
      cart_json: cartJson,
      user_id: options.userId ?? "",
      customer_email: options.customerEmail ?? "",
    },
  };

  let reservedRewardId: string | null = null;
  const rewardCode = options.rewardCode?.trim();
  if (rewardCode) {
    if (
      kind === "subscription" ||
      lineProducts.some((entry) => !isRewardDiscountProduct(entry.product))
    ) {
      return {
        ok: false,
        error: "Reward codes apply to one-time purchases.",
        status: 400,
      };
    }
    const db = requirePrisma();
    let claim = await claimRewardCode(db, {
      code: rewardCode,
      userId: options.userId ?? null,
    });
    if (!claim.ok && claim.error === "reward_stale_reservation") {
      const previous = await stripe.checkout.sessions.retrieve(
        claim.previousSessionId,
      );
      if (previous.payment_status === "paid") {
        return {
          ok: false,
          error: "This code can't be used on this account.",
          status: 400,
        };
      }
      const detached = await detachReservationSession(db, {
        rewardCodeId: claim.rewardCodeId,
        userId: options.userId!,
        previousSessionId: claim.previousSessionId,
      });
      if (!detached) {
        return {
          ok: false,
          error: "This code is already on an open checkout.",
          status: 409,
        };
      }
      if (previous.status === "open") {
        await stripe.checkout.sessions.expire(previous.id).catch(() => undefined);
      }
      claim = { ok: true, rewardCodeId: claim.rewardCodeId };
    }
    if (!claim.ok) {
      const status = claim.error === "reward_busy" ? 409 : claim.error === "reward_signin" ? 401 : 400;
      const error =
        claim.error === "reward_busy"
          ? "This code is already on an open checkout."
          : claim.error === "reward_signin"
            ? "Sign in to use a reward code."
            : claim.error === "reward_first_order"
              ? "This code is only for your first order."
              : "This code can't be used on this account.";
      return { ok: false, error, status };
    }
    reservedRewardId = claim.rewardCodeId;
    const couponId = await ensureRewardCoupon();
    params.metadata = {
      ...params.metadata,
      reward_code_id: claim.rewardCodeId,
    };
    const reserved = await db.rewardCode.findUnique({
      where: { id: claim.rewardCodeId },
      select: { stripePromotionCodeId: true, shared: true },
    });
    if (reserved?.stripePromotionCodeId && !reserved.shared) {
      await setRewardPromotionActive(reserved.stripePromotionCodeId, true);
      params.discounts = [{ promotion_code: reserved.stripePromotionCodeId }];
    } else {
      params.discounts = [{ coupon: couponId }];
    }
  } else if (kind !== "subscription") {
    params.allow_promotion_codes = true;
  }

  if (isAutomaticTaxEnabled()) {
    params.automatic_tax = { enabled: true };
  }

  if (kind === "subscription") {
    const only = lineProducts[0]!.product;
    params.subscription_data = {
      metadata: {
        catalog_product_id: only.id,
        locale,
        user_id: options.userId ?? "",
      },
    };
  } else {
    params.payment_intent_data = {
      metadata: {
        locale,
        cart_product_ids: lineProducts.map((e) => e.product.id).join(","),
        user_id: options.userId ?? "",
        ...(reservedRewardId ? { reward_code_id: reservedRewardId } : {}),
      },
    };
  }

  // Charge currency stays CAD even if Adaptive Pricing is on in the Stripe Dashboard.
  params.adaptive_pricing = { enabled: false };

  let session: Stripe.Checkout.Session | null = null;
  try {
    session = await stripe.checkout.sessions.create(params);
    if (reservedRewardId) {
      try {
        await attachReservationSession(requirePrisma(), {
          rewardCodeId: reservedRewardId,
          userId: options.userId!,
          checkoutSessionId: session.id,
        });
      } catch (attachError) {
        await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
        throw attachError;
      }
    }
  } catch (error) {
    if (reservedRewardId) {
      const released = await releaseRewardReservationById(
        requirePrisma(),
        reservedRewardId,
        options.userId ?? undefined,
      );
      for (const row of released) {
        if (row.stripePromotionCodeId) {
          await setRewardPromotionActive(row.stripePromotionCodeId, true).catch(
            () => undefined,
          );
        }
      }
    }
    throw error;
  }

  if (!session?.url) {
    if (reservedRewardId && session) {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
      const released = await releaseRewardReservationById(
        requirePrisma(),
        reservedRewardId,
        options.userId ?? undefined,
      );
      for (const row of released) {
        if (row.stripePromotionCodeId) {
          await setRewardPromotionActive(row.stripePromotionCodeId, true).catch(
            () => undefined,
          );
        }
      }
    }
    return {
      ok: false,
      error: "Stripe did not return a checkout URL.",
      status: 502,
    };
  }

  return { ok: true, url: session.url, sessionId: session.id };
}
