import "server-only";
import { getStripe } from "@/lib/stripe/client";

export const REWARD_COUPON_ID = "chocobanana_reward_10";

function isMissingCoupon(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  return (error as { code?: string }).code === "resource_missing";
}

/** One reusable 10% coupon. Product line items only; Stripe does not reduce shipping. */
export async function ensureRewardCoupon(): Promise<string> {
  const stripe = getStripe();
  try {
    const existing = await stripe.coupons.retrieve(REWARD_COUPON_ID);
    if (!existing.valid || existing.percent_off !== 10) {
      throw new Error("Reward coupon is not a valid 10% product discount.");
    }
    return existing.id;
  } catch (error) {
    if (!isMissingCoupon(error)) throw error;
  }

  try {
    const created = await stripe.coupons.create({
      id: REWARD_COUPON_ID,
      percent_off: 10,
      duration: "once",
      name: "Reward 10% off",
      metadata: { purpose: "customer_reward" },
    });
    return created.id;
  } catch (error) {
    if (isMissingCoupon(error)) throw error;
    const again = await stripe.coupons.retrieve(REWARD_COUPON_ID);
    if (!again.valid || again.percent_off !== 10) {
      throw error;
    }
    return again.id;
  }
}

export async function setRewardPromotionActive(
  promotionCodeId: string,
  active: boolean,
) {
  await getStripe().promotionCodes.update(promotionCodeId, { active });
}
