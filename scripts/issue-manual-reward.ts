import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

config({ path: ".env.local" });

const CODE = "CHOCO10";
const EMAIL = "buseogz0@gmail.com";
const COUPON_ID = "chocobanana_reward_10";

async function main() {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret || secret.startsWith("sk_live")) {
    throw new Error("Refusing to issue a reward without a Stripe test secret.");
  }

  const prisma = new PrismaClient();
  const stripe = new Stripe(secret);

  try {
    const user = await prisma.user.findUnique({
      where: { email: EMAIL },
      select: { id: true, role: true, stripeCustomerId: true, email: true },
    });
    if (!user || user.role !== "CUSTOMER" || !user.email) {
      throw new Error("Customer account was not found.");
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    try {
      const coupon = await stripe.coupons.retrieve(COUPON_ID);
      if (coupon.percent_off !== 10) throw new Error("Coupon is not 10%.");
    } catch (error) {
      const missing =
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "resource_missing";
      if (!missing) throw error;
      await stripe.coupons.create({
        id: COUPON_ID,
        percent_off: 10,
        duration: "once",
        name: "Reward 10% off",
        metadata: { purpose: "customer_reward" },
      });
    }

    const existing = await prisma.rewardCode.findFirst({
      where: { userId: user.id, manual: true, status: { in: ["AVAILABLE", "RESERVED"] } },
    });

    let promotionCodeId = existing?.stripePromotionCodeId ?? null;
    let code = existing?.code ?? CODE;

    if (!promotionCodeId) {
      const created = await stripe.promotionCodes.create({
        code,
        customer: stripeCustomerId,
        max_redemptions: 1,
        promotion: { type: "coupon", coupon: COUPON_ID },
        metadata: { user_id: user.id, manual: "true" },
      });
      promotionCodeId = created.id;
    }

    if (!existing) {
      await prisma.rewardCode.create({
        data: {
          code,
          userId: user.id,
          milestone: 0,
          percentOff: 10,
          manual: true,
          status: "AVAILABLE",
          stripePromotionCodeId: promotionCodeId,
        },
      });
    } else if (!existing.stripePromotionCodeId) {
      await prisma.rewardCode.update({
        where: { id: existing.id },
        data: { stripePromotionCodeId: promotionCodeId },
      });
    }

    const priced = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: 1800,
            product_data: { name: "Letter Sets" },
          },
        },
      ],
      discounts: [{ promotion_code: promotionCodeId }],
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });

    const discount = priced.total_details?.amount_discount ?? 0;
    const total = priced.amount_total ?? 0;
    await stripe.checkout.sessions.expire(priced.id);
    const promo = await stripe.promotionCodes.retrieve(promotionCodeId);

    if (priced.amount_subtotal !== 1800 || discount !== 180 || total !== 1620) {
      throw new Error(
        `Expected CA$18.00 − 10% = CA$16.20, got subtotal ${priced.amount_subtotal} discount ${discount} total ${total}.`,
      );
    }
    if (promo.times_redeemed !== 0 || promo.active !== true) {
      throw new Error("Promotion code was consumed by the unpaid test session.");
    }

    console.log(`code=${code} discount_ok=180 total_ok=1620 still_usable=yes`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "issue failed");
  process.exit(1);
});
