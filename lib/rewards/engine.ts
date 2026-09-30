import type { Prisma, PrismaClient } from "@prisma/client";
import {
  countsTowardReward,
  generateRewardCode,
  milestonesForCount,
  normalizeRewardCode,
  REWARD_PERCENT_OFF,
  rewardDiscountCadCents,
} from "@/lib/rewards/logic";

type RewardDb = PrismaClient | Prisma.TransactionClient;

export type RewardClaim =
  | { ok: true; rewardCodeId: string }
  | {
      ok: false;
      error: "reward_invalid" | "reward_busy" | "reward_signin" | "reward_first_order";
    }
  | {
      ok: false;
      error: "reward_stale_reservation";
      rewardCodeId: string;
      previousSessionId: string;
    };

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

export async function listQualifyingOrders(db: RewardDb, userId: string) {
  return db.order.findMany({
    where: { userId, ...qualifyingOrderWhere },
    orderBy: { createdAt: "asc" },
    select: { id: true, createdAt: true },
  });
}

export async function reconcileCustomerRewards(db: RewardDb, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || user.role !== "CUSTOMER") return;

  const orders = await listQualifyingOrders(db, userId);
  const expected = new Set(milestonesForCount(orders.length));
  const existing = await db.rewardCode.findMany({ where: { userId } });
  const earnedOrderIds = new Set(
    existing
      .map((code) => code.earnedFromOrderId)
      .filter((id): id is string => Boolean(id)),
  );

  for (const code of existing) {
    if (code.manual) continue;
    const stillEarned = expected.has(code.milestone);
    if (!stillEarned) {
      if (code.status === "AVAILABLE") {
        await db.rewardCode.update({
          where: { id: code.id },
          data: {
            status: "VOID",
            voidedAt: new Date(),
            reservedAt: null,
            reservedCheckoutSessionId: null,
          },
        });
        if (code.earnedFromOrderId) earnedOrderIds.delete(code.earnedFromOrderId);
      }
      continue;
    }

    const earnedFromOrderId = orders[code.milestone - 1]!.id;
    if (code.status === "VOID") {
      if (earnedOrderIds.has(earnedFromOrderId) && code.earnedFromOrderId !== earnedFromOrderId) {
        continue;
      }
      await db.rewardCode.update({
        where: { id: code.id },
        data: {
          status: "AVAILABLE",
          voidedAt: null,
          reservedAt: null,
          reservedCheckoutSessionId: null,
          earnedFromOrderId,
        },
      });
      if (code.earnedFromOrderId) earnedOrderIds.delete(code.earnedFromOrderId);
      earnedOrderIds.add(earnedFromOrderId);
      continue;
    }

    if (
      code.earnedFromOrderId !== earnedFromOrderId &&
      !earnedOrderIds.has(earnedFromOrderId)
    ) {
      await db.rewardCode.update({
        where: { id: code.id },
        data: { earnedFromOrderId },
      });
      if (code.earnedFromOrderId) earnedOrderIds.delete(code.earnedFromOrderId);
      earnedOrderIds.add(earnedFromOrderId);
    }
  }

  const after = await db.rewardCode.findMany({
    where: { userId },
    select: { milestone: true },
  });
  const have = new Set(after.map((code) => code.milestone));

  for (const milestone of expected) {
    if (have.has(milestone)) continue;
    const earnedFromOrderId = orders[milestone - 1]!.id;
    if (earnedOrderIds.has(earnedFromOrderId)) continue;
    await db.rewardCode.create({
      data: {
        code: generateRewardCode(),
        userId,
        milestone,
        percentOff: REWARD_PERCENT_OFF,
        status: "AVAILABLE",
        earnedFromOrderId,
      },
    });
    earnedOrderIds.add(earnedFromOrderId);
  }
}

function isUniqueConflict(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

async function firstOrderBlock(
  db: RewardDb,
  userId: string,
  firstOrderOnly: boolean,
): Promise<boolean> {
  if (!firstOrderOnly) return false;
  const paid = await db.order.count({
    where: { userId, ...qualifyingOrderWhere },
  });
  return paid > 0;
}

async function claimSharedReward(
  db: RewardDb,
  row: { id: string; firstOrderOnly: boolean },
  userId: string,
): Promise<RewardClaim> {
  if (await firstOrderBlock(db, userId, row.firstOrderOnly)) {
    return { ok: false, error: "reward_first_order" };
  }

  const existing = await db.rewardCodeRedemption.findUnique({
    where: { rewardCodeId_userId: { rewardCodeId: row.id, userId } },
  });
  if (existing?.status === "USED" || existing?.status === "VOID") {
    return { ok: false, error: "reward_invalid" };
  }
  if (existing?.status === "RESERVED" && existing.reservedCheckoutSessionId) {
    return {
      ok: false,
      error: "reward_stale_reservation",
      rewardCodeId: row.id,
      previousSessionId: existing.reservedCheckoutSessionId,
    };
  }
  if (existing?.status === "RESERVED") {
    return { ok: true, rewardCodeId: row.id };
  }

  if (!existing) {
    try {
      await db.rewardCodeRedemption.create({
        data: {
          rewardCodeId: row.id,
          userId,
          status: "RESERVED",
          reservedAt: new Date(),
        },
      });
      return { ok: true, rewardCodeId: row.id };
    } catch (error) {
      if (!isUniqueConflict(error)) throw error;
    }
  }

  const claimed = await db.rewardCodeRedemption.updateMany({
    where: {
      rewardCodeId: row.id,
      userId,
      status: "AVAILABLE",
    },
    data: { status: "RESERVED", reservedAt: new Date(), reservedCheckoutSessionId: null },
  });
  if (claimed.count !== 1) return { ok: false, error: "reward_busy" };
  return { ok: true, rewardCodeId: row.id };
}

export async function claimRewardCode(
  db: RewardDb,
  options: { code: string; userId: string | null },
): Promise<RewardClaim> {
  if (!options.userId) return { ok: false, error: "reward_signin" };

  const user = await db.user.findUnique({
    where: { id: options.userId },
    select: { role: true },
  });
  if (!user || user.role !== "CUSTOMER") {
    return { ok: false, error: "reward_invalid" };
  }

  const normalized = normalizeRewardCode(options.code);
  if (!normalized) return { ok: false, error: "reward_invalid" };

  const row = await db.rewardCode.findUnique({ where: { code: normalized } });
  if (!row || row.percentOff !== REWARD_PERCENT_OFF || row.status === "VOID") {
    return { ok: false, error: "reward_invalid" };
  }

  if (row.shared) {
    return claimSharedReward(db, row, options.userId);
  }

  if (row.userId !== options.userId || row.status === "USED") {
    return { ok: false, error: "reward_invalid" };
  }

  if (row.status === "RESERVED") {
    if (row.reservedCheckoutSessionId) {
      return {
        ok: false,
        error: "reward_stale_reservation",
        rewardCodeId: row.id,
        previousSessionId: row.reservedCheckoutSessionId,
      };
    }
    return { ok: false, error: "reward_busy" };
  }

  const claimed = await db.rewardCode.updateMany({
    where: { id: row.id, userId: options.userId, status: "AVAILABLE" },
    data: {
      status: "RESERVED",
      reservedAt: new Date(),
      reservedCheckoutSessionId: null,
    },
  });
  if (claimed.count !== 1) return { ok: false, error: "reward_busy" };
  return { ok: true, rewardCodeId: row.id };
}

export async function detachReservationSession(
  db: RewardDb,
  options: { rewardCodeId: string; userId: string; previousSessionId: string },
): Promise<boolean> {
  const shared = await db.rewardCode.findUnique({
    where: { id: options.rewardCodeId },
    select: { shared: true },
  });
  if (shared?.shared) {
    const updated = await db.rewardCodeRedemption.updateMany({
      where: {
        rewardCodeId: options.rewardCodeId,
        userId: options.userId,
        status: "RESERVED",
        reservedCheckoutSessionId: options.previousSessionId,
      },
      data: { reservedCheckoutSessionId: null, reservedAt: new Date() },
    });
    return updated.count === 1;
  }

  const updated = await db.rewardCode.updateMany({
    where: {
      id: options.rewardCodeId,
      userId: options.userId,
      status: "RESERVED",
      reservedCheckoutSessionId: options.previousSessionId,
    },
    data: { reservedCheckoutSessionId: null, reservedAt: new Date() },
  });
  return updated.count === 1;
}

export async function attachReservationSession(
  db: RewardDb,
  options: { rewardCodeId: string; userId: string; checkoutSessionId: string },
) {
  const shared = await db.rewardCode.findUnique({
    where: { id: options.rewardCodeId },
    select: { shared: true },
  });
  if (shared?.shared) {
    const updated = await db.rewardCodeRedemption.updateMany({
      where: {
        rewardCodeId: options.rewardCodeId,
        userId: options.userId,
        status: "RESERVED",
        reservedCheckoutSessionId: null,
      },
      data: { reservedCheckoutSessionId: options.checkoutSessionId },
    });
    if (updated.count !== 1) {
      throw new Error("Reward reservation could not be attached to checkout.");
    }
    return;
  }

  const updated = await db.rewardCode.updateMany({
    where: {
      id: options.rewardCodeId,
      status: "RESERVED",
      reservedCheckoutSessionId: null,
    },
    data: { reservedCheckoutSessionId: options.checkoutSessionId },
  });
  if (updated.count !== 1) {
    throw new Error("Reward reservation could not be attached to checkout.");
  }
}

export async function releaseRewardReservationById(
  db: RewardDb,
  rewardCodeId: string,
  userId?: string,
) {
  const shared = await db.rewardCode.findUnique({
    where: { id: rewardCodeId },
    select: { shared: true },
  });
  if (shared?.shared) {
    if (!userId) return [];
    await db.rewardCodeRedemption.updateMany({
      where: { rewardCodeId, userId, status: "RESERVED" },
      data: {
        status: "AVAILABLE",
        reservedAt: null,
        reservedCheckoutSessionId: null,
      },
    });
    return [];
  }

  const rows = await db.rewardCode.findMany({
    where: { id: rewardCodeId, status: "RESERVED" },
    select: { stripePromotionCodeId: true },
  });
  await db.rewardCode.updateMany({
    where: { id: rewardCodeId, status: "RESERVED" },
    data: {
      status: "AVAILABLE",
      reservedAt: null,
      reservedCheckoutSessionId: null,
    },
  });
  return rows;
}

export async function releaseRewardReservationForSession(
  db: RewardDb,
  checkoutSessionId: string,
) {
  await db.rewardCodeRedemption.updateMany({
    where: {
      reservedCheckoutSessionId: checkoutSessionId,
      status: "RESERVED",
    },
    data: {
      status: "AVAILABLE",
      reservedAt: null,
      reservedCheckoutSessionId: null,
    },
  });

  const rows = await db.rewardCode.findMany({
    where: {
      reservedCheckoutSessionId: checkoutSessionId,
      status: "RESERVED",
    },
    select: { stripePromotionCodeId: true },
  });
  await db.rewardCode.updateMany({
    where: {
      reservedCheckoutSessionId: checkoutSessionId,
      status: "RESERVED",
    },
    data: {
      status: "AVAILABLE",
      reservedAt: null,
      reservedCheckoutSessionId: null,
    },
  });
  return rows;
}

async function consumeSharedRedemption(
  db: RewardDb,
  options: {
    rewardCodeId: string;
    userId?: string;
    checkoutSessionId?: string;
    orderId: string;
    discountCadCents: number;
    from: "AVAILABLE" | "RESERVED";
  },
) {
  const where =
    options.from === "RESERVED"
      ? {
          rewardCodeId: options.rewardCodeId,
          status: "RESERVED" as const,
          reservedCheckoutSessionId: options.checkoutSessionId,
        }
      : {
          rewardCodeId: options.rewardCodeId,
          userId: options.userId,
          status: "AVAILABLE" as const,
        };
  const consumed = await db.rewardCodeRedemption.updateMany({
    where,
    data: {
      status: "USED",
      usedAt: new Date(),
      usedOnOrderId: options.orderId,
      reservedAt: null,
      reservedCheckoutSessionId: null,
    },
  });
  if (consumed.count === 1) {
    await db.order.update({
      where: { id: options.orderId },
      data: { discountAmountCadCents: options.discountCadCents },
    });
    return;
  }
  const current = await db.rewardCodeRedemption.findFirst({
    where: { rewardCodeId: options.rewardCodeId, usedOnOrderId: options.orderId },
    select: { status: true },
  });
  if (current?.status === "USED") return;
  throw new Error("Reward code could not be consumed for this payment.");
}

export async function consumeAvailableReward(
  db: RewardDb,
  options: {
    rewardCodeId: string;
    userId: string;
    orderId: string;
    discountCadCents: number;
  },
) {
  const shared = await db.rewardCode.findUnique({
    where: { id: options.rewardCodeId },
    select: { shared: true },
  });
  if (shared?.shared) {
    await consumeSharedRedemption(db, { ...options, from: "AVAILABLE" });
    return;
  }

  const consumed = await db.rewardCode.updateMany({
    where: {
      id: options.rewardCodeId,
      userId: options.userId,
      status: "AVAILABLE",
    },
    data: {
      status: "USED",
      usedAt: new Date(),
      usedOnOrderId: options.orderId,
      reservedAt: null,
      reservedCheckoutSessionId: null,
    },
  });
  if (consumed.count === 1) {
    await db.order.update({
      where: { id: options.orderId },
      data: { discountAmountCadCents: options.discountCadCents },
    });
    return;
  }
  const current = await db.rewardCode.findUnique({
    where: { id: options.rewardCodeId },
    select: { status: true, usedOnOrderId: true, userId: true },
  });
  if (
    current?.userId === options.userId &&
    current.status === "USED" &&
    current.usedOnOrderId === options.orderId
  ) {
    return;
  }
  throw new Error("Reward code could not be consumed for this payment.");
}

export async function consumeReservedReward(
  db: RewardDb,
  options: {
    rewardCodeId: string;
    checkoutSessionId: string;
    orderId: string;
    discountCadCents: number;
  },
) {
  const shared = await db.rewardCode.findUnique({
    where: { id: options.rewardCodeId },
    select: { shared: true },
  });
  if (shared?.shared) {
    await consumeSharedRedemption(db, { ...options, from: "RESERVED" });
    return;
  }

  const consumed = await db.rewardCode.updateMany({
    where: {
      id: options.rewardCodeId,
      status: "RESERVED",
      reservedCheckoutSessionId: options.checkoutSessionId,
    },
    data: {
      status: "USED",
      usedAt: new Date(),
      usedOnOrderId: options.orderId,
      reservedAt: null,
      reservedCheckoutSessionId: null,
    },
  });

  if (consumed.count === 1) {
    await db.order.update({
      where: { id: options.orderId },
      data: { discountAmountCadCents: options.discountCadCents },
    });
    return;
  }

  const current = await db.rewardCode.findUnique({
    where: { id: options.rewardCodeId },
    select: { status: true, usedOnOrderId: true },
  });
  if (current?.status === "USED" && current.usedOnOrderId === options.orderId) {
    return;
  }
  throw new Error("Reward code could not be consumed for this payment.");
}

export async function markOrderFullyRefunded(db: RewardDb, orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, paymentStatus: true },
  });
  if (!order || order.paymentStatus === "REFUNDED") return order;

  await db.order.update({
    where: { id: order.id },
    data: { paymentStatus: "REFUNDED" },
  });

  await db.rewardCode.updateMany({
    where: { usedOnOrderId: order.id, status: "USED", shared: false },
    data: {
      status: "AVAILABLE",
      usedOnOrderId: null,
      usedAt: null,
    },
  });
  await db.rewardCodeRedemption.updateMany({
    where: { usedOnOrderId: order.id, status: "USED" },
    data: {
      status: "AVAILABLE",
      usedOnOrderId: null,
      usedAt: null,
    },
  });

  if (order.userId) {
    await reconcileCustomerRewards(db, order.userId);
  }
  return order;
}

export async function customerRewardView(db: RewardDb, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || user.role !== "CUSTOMER") {
    return { qualifyingCount: 0, codes: [] as const };
  }
  const [orders, codes, sharedCodes] = await Promise.all([
    listQualifyingOrders(db, userId),
    db.rewardCode.findMany({
      where: { userId, shared: false, status: { in: ["AVAILABLE", "RESERVED"] } },
      orderBy: { milestone: "asc" },
      select: {
        code: true,
        status: true,
        percentOff: true,
        milestone: true,
        firstOrderOnly: true,
      },
    }),
    sharedRewardCodesForCustomer(db, userId),
  ]);
  return {
    qualifyingCount: orders.length,
    codes: [...sharedCodes, ...codes],
  };
}

async function sharedRewardCodesForCustomer(db: RewardDb, userId: string) {
  const paid = await db.order.count({
    where: { userId, ...qualifyingOrderWhere },
  });
  const shared = await db.rewardCode.findMany({
    where: { shared: true, status: { not: "VOID" } },
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      percentOff: true,
      milestone: true,
      firstOrderOnly: true,
    },
  });
  const visible: {
    code: string;
    status: string;
    percentOff: number;
    milestone: number;
    firstOrderOnly: boolean;
  }[] = [];
  for (const code of shared) {
    if (code.firstOrderOnly && paid > 0) continue;
    const redemption = await db.rewardCodeRedemption.findUnique({
      where: { rewardCodeId_userId: { rewardCodeId: code.id, userId } },
      select: { status: true },
    });
    if (redemption?.status === "USED" || redemption?.status === "VOID") continue;
    visible.push({
      code: code.code,
      status: redemption?.status === "RESERVED" ? "RESERVED" : "AVAILABLE",
      percentOff: code.percentOff,
      milestone: code.milestone,
      firstOrderOnly: code.firstOrderOnly,
    });
  }
  return visible;
}

export async function rewardSnapshotsForUsers(db: RewardDb, userIds: string[]) {
  if (userIds.length === 0) return new Map<string, {
    qualifyingCount: number;
    codes: { code: string; status: string; milestone: number; firstOrderOnly: boolean }[];
  }>();

  const [orders, codes, shared] = await Promise.all([
    db.order.findMany({
      where: { userId: { in: userIds }, ...qualifyingOrderWhere },
      select: { userId: true },
    }),
    db.rewardCode.findMany({
      where: { userId: { in: userIds }, shared: false },
      orderBy: { milestone: "asc" },
      select: { userId: true, code: true, status: true, milestone: true },
    }),
    db.rewardCode.findMany({
      where: { shared: true, status: { not: "VOID" } },
      select: { id: true, code: true, milestone: true, firstOrderOnly: true },
    }),
  ]);
  const redemptions = shared.length
    ? await db.rewardCodeRedemption.findMany({
        where: {
          rewardCodeId: { in: shared.map((code) => code.id) },
          userId: { in: userIds },
        },
        select: { rewardCodeId: true, userId: true, status: true },
      })
    : [];

  const snapshots = new Map<string, {
    qualifyingCount: number;
    codes: { code: string; status: string; milestone: number; firstOrderOnly: boolean }[];
  }>();
  for (const userId of userIds) {
    snapshots.set(userId, { qualifyingCount: 0, codes: [] });
  }
  for (const order of orders) {
    if (!order.userId) continue;
    const snap = snapshots.get(order.userId);
    if (snap) snap.qualifyingCount += 1;
  }
  for (const code of codes) {
    snapshots.get(code.userId)?.codes.push({
      code: code.code,
      status: code.status,
      milestone: code.milestone,
      firstOrderOnly: false,
    });
  }
  for (const userId of userIds) {
    const snap = snapshots.get(userId);
    if (!snap) continue;
    for (const code of shared) {
      const redemption = redemptions.find(
        (entry) => entry.rewardCodeId === code.id && entry.userId === userId,
      );
      if (redemption?.status === "USED" || redemption?.status === "VOID") continue;
      if (code.firstOrderOnly && snap.qualifyingCount > 0) continue;
      snap.codes.unshift({
        code: code.code,
        status: redemption?.status === "RESERVED" ? "RESERVED" : "AVAILABLE",
        milestone: code.milestone,
        firstOrderOnly: code.firstOrderOnly,
      });
    }
  }
  return snapshots;
}

export async function quoteRewardCode(
  db: RewardDb,
  options: {
    code: string;
    userId: string | null;
    subtotalCadCents: number;
  },
) {
  if (!options.userId) return { ok: false as const, error: "reward_signin" as const };
  const user = await db.user.findUnique({
    where: { id: options.userId },
    select: { role: true },
  });
  if (!user || user.role !== "CUSTOMER") {
    return { ok: false as const, error: "reward_invalid" as const };
  }
  const normalized = normalizeRewardCode(options.code);
  const row = normalized
    ? await db.rewardCode.findUnique({ where: { code: normalized } })
    : null;
  if (!row || row.percentOff !== REWARD_PERCENT_OFF || row.status === "VOID") {
    return { ok: false as const, error: "reward_invalid" as const };
  }
  if (row.shared) {
    if (await firstOrderBlock(db, options.userId, row.firstOrderOnly)) {
      return { ok: false as const, error: "reward_first_order" as const };
    }
    const redemption = await db.rewardCodeRedemption.findUnique({
      where: { rewardCodeId_userId: { rewardCodeId: row.id, userId: options.userId } },
      select: { status: true },
    });
    if (redemption?.status === "USED" || redemption?.status === "VOID") {
      return { ok: false as const, error: "reward_invalid" as const };
    }
  } else if (
    row.userId !== options.userId ||
    row.status === "USED"
  ) {
    return { ok: false as const, error: "reward_invalid" as const };
  }
  const discountCadCents = rewardDiscountCadCents(options.subtotalCadCents);
  return {
    ok: true as const,
    code: row.code,
    percentOff: row.percentOff,
    subtotalCadCents: options.subtotalCadCents,
    discountCadCents,
    totalCadCents: options.subtotalCadCents - discountCadCents,
  };
}
