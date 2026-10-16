import type { Prisma, PrismaClient } from "@prisma/client";

type WelcomeDb = PrismaClient | Prisma.TransactionClient;

/** Same paid-order rule as the every-5-orders reward counter. */
const qualifyingOrderWhere = {
  paymentStatus: "PAID" as const,
  OR: [
    { billingReason: null },
    {
      billingReason: {
        notIn: ["subscription_cycle", "subscription_update"],
      },
    },
  ],
};

/**
 * One discount per checkout. A typed reward code wins; otherwise an eligible
 * member gets the automatic welcome discount. Never both.
 */
export function chooseCheckoutDiscount(input: {
  rewardCode?: string | null;
  welcomeEligible: boolean;
}): "reward" | "welcome" | "none" {
  if (input.rewardCode?.trim()) return "reward";
  if (input.welcomeEligible) return "welcome";
  return "none";
}

export async function readWelcomeDiscount(
  db: WelcomeDb,
  userId: string,
): Promise<{ eligible: true; previousSessionId: string | null } | { eligible: false }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      welcomeDiscountUsedAt: true,
      welcomeReservedSessionId: true,
    },
  });
  if (!user || user.role !== "CUSTOMER" || user.welcomeDiscountUsedAt) {
    return { eligible: false };
  }
  const paid = await db.order.count({
    where: { userId, ...qualifyingOrderWhere },
  });
  if (paid > 0) return { eligible: false };
  return { eligible: true, previousSessionId: user.welcomeReservedSessionId };
}

export async function attachWelcomeReservation(
  db: WelcomeDb,
  userId: string,
  sessionId: string,
  previousSessionId: string | null,
): Promise<boolean> {
  const updated = await db.user.updateMany({
    where: {
      id: userId,
      role: "CUSTOMER",
      welcomeDiscountUsedAt: null,
      OR: [
        { welcomeReservedSessionId: null },
        ...(previousSessionId
          ? [{ welcomeReservedSessionId: previousSessionId }]
          : []),
      ],
    },
    data: { welcomeReservedSessionId: sessionId },
  });
  return updated.count === 1;
}

/** Clears a hold after a failed, expired, or canceled checkout. Does not mark it used. */
export async function releaseWelcomeReservation(
  db: WelcomeDb,
  sessionId: string,
): Promise<void> {
  await db.user.updateMany({
    where: {
      welcomeReservedSessionId: sessionId,
      welcomeDiscountUsedAt: null,
    },
    data: { welcomeReservedSessionId: null },
  });
}

/** Call only after a verified paid Checkout Session. */
export async function consumeWelcomeDiscount(
  db: WelcomeDb,
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const updated = await db.user.updateMany({
    where: {
      id: userId,
      role: "CUSTOMER",
      welcomeDiscountUsedAt: null,
      welcomeReservedSessionId: sessionId,
    },
    data: {
      welcomeDiscountUsedAt: new Date(),
      welcomeReservedSessionId: null,
    },
  });
  return updated.count === 1;
}

/** Claims the one welcome email. A second call returns false. */
export async function claimWelcomeEmailSend(
  db: WelcomeDb,
  userId: string,
): Promise<boolean> {
  const updated = await db.user.updateMany({
    where: {
      id: userId,
      role: "CUSTOMER",
      emailVerified: { not: null },
      welcomeEmailSentAt: null,
    },
    data: { welcomeEmailSentAt: new Date() },
  });
  return updated.count === 1;
}

export async function releaseWelcomeEmailClaim(
  db: WelcomeDb,
  userId: string,
): Promise<void> {
  await db.user.updateMany({
    where: { id: userId },
    data: { welcomeEmailSentAt: null },
  });
}

export async function claimOrderConfirmationSend(
  db: WelcomeDb,
  orderId: string,
): Promise<boolean> {
  const updated = await db.order.updateMany({
    where: { id: orderId, confirmationEmailSentAt: null },
    data: { confirmationEmailSentAt: new Date() },
  });
  return updated.count === 1;
}

export async function releaseOrderConfirmationClaim(
  db: WelcomeDb,
  orderId: string,
): Promise<void> {
  await db.order.updateMany({
    where: { id: orderId },
    data: { confirmationEmailSentAt: null },
  });
}
