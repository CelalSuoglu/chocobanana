import "server-only";
import type Stripe from "stripe";
import { requirePrisma } from "@/lib/db";
import {
  consumeAvailableReward,
  consumeReservedReward,
  markOrderFullyRefunded,
  reconcileCustomerRewards,
  releaseRewardReservationForSession,
} from "@/lib/rewards/engine";
import { rewardDiscountCadCents } from "@/lib/rewards/logic";
import { getStripe } from "@/lib/stripe/client";
import { setRewardPromotionActive } from "@/lib/stripe/reward-coupon";

async function reactivatePromotionCodes(
  rows: { stripePromotionCodeId: string | null }[],
) {
  for (const row of rows) {
    if (!row.stripePromotionCodeId) continue;
    await setRewardPromotionActive(row.stripePromotionCodeId, true).catch(
      () => undefined,
    );
  }
}

function promotionCodeIdFromSession(session: Stripe.Checkout.Session): string | null {
  const discounts = session.total_details?.breakdown?.discounts ?? [];
  for (const entry of discounts) {
    const promo = entry.discount?.promotion_code;
    if (typeof promo === "string" && promo) return promo;
    if (promo && typeof promo === "object" && "id" in promo && promo.id) {
      return promo.id;
    }
  }
  return null;
}

function discountMatchesReward(
  session: Stripe.Checkout.Session,
  discount: number,
): boolean {
  const subtotal = session.amount_subtotal ?? 0;
  const expected = rewardDiscountCadCents(subtotal);
  const lineCount = session.line_items?.data?.length ?? 1;
  return discount > 0 && Math.abs(discount - expected) <= Math.max(1, lineCount);
}

export async function settleRewardAfterPaidCheckout(options: {
  session: Stripe.Checkout.Session;
  orderId: string;
  userId: string | null;
}) {
  const prisma = requirePrisma();
  const rewardCodeId = options.session.metadata?.reward_code_id?.trim();
  const discount = options.session.total_details?.amount_discount ?? 0;

  if (rewardCodeId) {
    if (!discountMatchesReward(options.session, discount)) {
      const released = await releaseRewardReservationForSession(
        prisma,
        options.session.id,
      );
      await reactivatePromotionCodes(released);
    } else {
      await consumeReservedReward(prisma, {
        rewardCodeId,
        checkoutSessionId: options.session.id,
        orderId: options.orderId,
        discountCadCents: discount,
      });
    }
  } else if (options.userId) {
    const promotionCodeId = promotionCodeIdFromSession(options.session);
    if (promotionCodeId && discountMatchesReward(options.session, discount)) {
      const row = await prisma.rewardCode.findUnique({
        where: { stripePromotionCodeId: promotionCodeId },
        select: {
          id: true,
          userId: true,
          shared: true,
          status: true,
          stripePromotionCodeId: true,
          reservedCheckoutSessionId: true,
          usedOnOrderId: true,
        },
      });
      if (row?.shared && options.userId && row.status !== "VOID") {
        const redemption = await prisma.rewardCodeRedemption.findUnique({
          where: {
            rewardCodeId_userId: { rewardCodeId: row.id, userId: options.userId },
          },
          select: { status: true, usedOnOrderId: true },
        });
        if (redemption?.status === "USED" && redemption.usedOnOrderId === options.orderId) {
          // Already recorded for this payment.
        } else if (redemption?.status === "AVAILABLE" || !redemption) {
          if (!redemption) {
            await prisma.rewardCodeRedemption.create({
              data: {
                rewardCodeId: row.id,
                userId: options.userId,
                status: "USED",
                usedAt: new Date(),
                usedOnOrderId: options.orderId,
              },
            });
          } else {
            await prisma.rewardCodeRedemption.updateMany({
              where: {
                rewardCodeId: row.id,
                userId: options.userId,
                status: "AVAILABLE",
              },
              data: {
                status: "USED",
                usedAt: new Date(),
                usedOnOrderId: options.orderId,
              },
            });
          }
          await prisma.order.update({
            where: { id: options.orderId },
            data: { discountAmountCadCents: discount },
          });
        }
      } else if (row && !row.shared && row.userId === options.userId && row.status !== "VOID") {
        if (row.status === "USED" && row.usedOnOrderId === options.orderId) {
          // Already consumed for this payment.
        } else if (
          row.status === "RESERVED" &&
          row.reservedCheckoutSessionId === options.session.id
        ) {
          await consumeReservedReward(prisma, {
            rewardCodeId: row.id,
            checkoutSessionId: options.session.id,
            orderId: options.orderId,
            discountCadCents: discount,
          });
        } else if (row.status === "AVAILABLE") {
          await consumeAvailableReward(prisma, {
            rewardCodeId: row.id,
            userId: options.userId,
            orderId: options.orderId,
            discountCadCents: discount,
          });
        }
        if (row.stripePromotionCodeId && row.status !== "RESERVED") {
          await setRewardPromotionActive(row.stripePromotionCodeId, false).catch(
            () => undefined,
          );
        }
      }
    }
  }

  if (options.userId) {
    await reconcileCustomerRewards(prisma, options.userId);
  }
}

export async function releaseRewardIfCheckoutClosed(options: {
  checkoutSessionId?: string | null;
  rewardCodeId?: string | null;
}) {
  const prisma = requirePrisma();
  if (options.checkoutSessionId) {
    const released = await releaseRewardReservationForSession(
      prisma,
      options.checkoutSessionId,
    );
    await reactivatePromotionCodes(released);
    return;
  }
  if (!options.rewardCodeId) return;

  const code = await prisma.rewardCode.findUnique({
    where: { id: options.rewardCodeId },
    select: { status: true, reservedCheckoutSessionId: true },
  });
  if (code?.status !== "RESERVED" || !code.reservedCheckoutSessionId) return;

  const session = await getStripe().checkout.sessions.retrieve(
    code.reservedCheckoutSessionId,
  );
  if (session.status === "open" || session.payment_status === "paid") return;
  const released = await releaseRewardReservationForSession(
    prisma,
    code.reservedCheckoutSessionId,
  );
  await reactivatePromotionCodes(released);
}

export async function applyFullRefundFromCharge(charge: Stripe.Charge) {
  if (!charge.refunded) return;
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  const prisma = requirePrisma();
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { id: true },
  });
  if (!order) return;
  await markOrderFullyRefunded(prisma, order.id);
}
