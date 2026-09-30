import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  claimRewardCode,
  consumeReservedReward,
  listQualifyingOrders,
  markOrderFullyRefunded,
  reconcileCustomerRewards,
  releaseRewardReservationForSession,
} from "../lib/rewards/engine";
import { countsTowardReward, progressTowardNextReward } from "../lib/rewards/logic";

config({ path: ".env.local" });

const prisma = new PrismaClient();

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function makeCustomer(label: string) {
  return prisma.user.create({
    data: {
      email: `reward-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`,
      passwordHash: "reward-test-not-a-login",
      role: "CUSTOMER",
    },
  });
}

async function makeOrder(
  userId: string,
  email: string,
  billingReason: string | null = null,
) {
  return prisma.order.create({
    data: {
      userId,
      stripeCheckoutSessionId: `cs_reward_${crypto.randomUUID()}`,
      paymentStatus: "PAID",
      amountTotalCadCents: 1200,
      currency: "cad",
      customerEmail: email,
      billingReason,
      items: {
        create: {
          catalogProductId: "snail-mail-3-canada",
          name: "Snail Mail Club — 3 months — Canada",
          quantity: 1,
          unitAmountCadCents: 3600,
          currency: "cad",
        },
      },
    },
  });
}

async function main() {
  assert(countsTowardReward(null), "one-time checkout counts");
  assert(countsTowardReward("subscription_create"), "first subscription charge counts once");
  assert(!countsTowardReward("subscription_cycle"), "renewal does not count");
  assert(progressTowardNextReward(4).current === 4, "4 orders is 4/5");
  assert(progressTowardNextReward(5).current === 0, "5th order resets progress");

  const customer = await makeCustomer("buyer");
  const other = await makeCustomer("other");
  const createdOrderIds: string[] = [];

  try {
    for (let i = 0; i < 4; i += 1) {
      createdOrderIds.push((await makeOrder(customer.id, customer.email)).id);
    }
    await reconcileCustomerRewards(prisma, customer.id);
    assert(
      (await prisma.rewardCode.count({ where: { userId: customer.id } })) === 0,
      "4 paid orders do not earn a code",
    );

    const renewal = await makeOrder(customer.id, customer.email, "subscription_cycle");
    createdOrderIds.push(renewal.id);
    await reconcileCustomerRewards(prisma, customer.id);
    assert(
      (await listQualifyingOrders(prisma, customer.id)).length === 4,
      "subscription renewal is not a qualifying order",
    );

    const fifth = await makeOrder(customer.id, customer.email);
    createdOrderIds.push(fifth.id);
    await reconcileCustomerRewards(prisma, customer.id);
    await reconcileCustomerRewards(prisma, customer.id);
    const codes = await prisma.rewardCode.findMany({ where: { userId: customer.id } });
    assert(codes.length === 1, "5th payment earns one code");
    assert(codes[0]?.status === "AVAILABLE", "new code is available");
    assert(codes[0]?.earnedFromOrderId === fifth.id, "code is earned by the 5th order");
    const code = codes[0]!.code;

    const packageOrder = await prisma.order.findUnique({
      where: { id: fifth.id },
      include: { items: true },
    });
    assert(
      packageOrder?.items.length === 1 &&
        packageOrder.items[0]?.catalogProductId === "snail-mail-3-canada",
      "a 3-month Mail Club package is one order",
    );

    const otherClaim = await claimRewardCode(prisma, { code, userId: other.id });
    assert(!otherClaim.ok && otherClaim.error === "reward_invalid", "other account cannot use the code");

    const guestClaim = await claimRewardCode(prisma, { code, userId: null });
    assert(!guestClaim.ok && guestClaim.error === "reward_signin", "guest cannot use the code");

    const first = await claimRewardCode(prisma, { code, userId: customer.id });
    const second = await claimRewardCode(prisma, { code, userId: customer.id });
    assert(first.ok, "owner of the code can reserve it");
    assert(!second.ok && second.error === "reward_busy", "a second checkout cannot reserve the same code");

    const sessionId = `cs_reward_open_${crypto.randomUUID()}`;
    if (!first.ok) throw new Error("reservation missing");
    await prisma.rewardCode.update({
      where: { id: first.rewardCodeId },
      data: { reservedCheckoutSessionId: sessionId },
    });
    await releaseRewardReservationForSession(prisma, sessionId);
    const afterFailure = await prisma.rewardCode.findUnique({ where: { code } });
    assert(afterFailure?.status === "AVAILABLE", "failed or expired checkout leaves the code usable");

    const [raceA, raceB] = await Promise.all([
      claimRewardCode(prisma, { code, userId: customer.id }),
      claimRewardCode(prisma, { code, userId: customer.id }),
    ]);
    const raceWins = [raceA, raceB].filter((result) => result.ok);
    assert(raceWins.length === 1, "only one concurrent checkout can hold the code");
    for (const win of raceWins) {
      if (win.ok) await releaseRewardReservationForSession(prisma, "unused");
      if (win.ok) {
        await prisma.rewardCode.updateMany({
          where: { id: win.rewardCodeId, status: "RESERVED" },
          data: { status: "AVAILABLE", reservedAt: null, reservedCheckoutSessionId: null },
        });
      }
    }

    const again = await claimRewardCode(prisma, { code, userId: customer.id });
    assert(again.ok, "code can be reserved after a failed payment");
    if (!again.ok) throw new Error("reservation missing");
    const paidSession = `cs_reward_paid_${crypto.randomUUID()}`;
    await prisma.rewardCode.update({
      where: { id: again.rewardCodeId },
      data: { reservedCheckoutSessionId: paidSession },
    });
    const usingOrder = await makeOrder(customer.id, customer.email);
    createdOrderIds.push(usingOrder.id);
    await consumeReservedReward(prisma, {
      rewardCodeId: again.rewardCodeId,
      checkoutSessionId: paidSession,
      orderId: usingOrder.id,
      discountCadCents: 120,
    });
    await consumeReservedReward(prisma, {
      rewardCodeId: again.rewardCodeId,
      checkoutSessionId: paidSession,
      orderId: usingOrder.id,
      discountCadCents: 120,
    });
    const used = await prisma.rewardCode.findUnique({ where: { code } });
    assert(used?.status === "USED" && used.usedOnOrderId === usingOrder.id, "successful payment consumes the code once");

    await reconcileCustomerRewards(prisma, customer.id);
    assert(
      (await prisma.rewardCode.count({ where: { userId: customer.id, status: "AVAILABLE" } })) === 0,
      "using the code does not immediately earn another one",
    );

    await markOrderFullyRefunded(prisma, fifth.id);
    const afterRefund = await prisma.rewardCode.findUnique({ where: { code } });
    const qualifying = await listQualifyingOrders(prisma, customer.id);
    assert(qualifying.every((order) => order.id !== fifth.id), "refunded order leaves the counter");
    assert(afterRefund?.status === "USED", "a code already used on another paid order stays used");

    console.log("reward flows ok");
  } finally {
    await prisma.rewardCode.deleteMany({
      where: { userId: { in: [customer.id, other.id] } },
    });
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: createdOrderIds } },
    });
    await prisma.order.deleteMany({
      where: { id: { in: createdOrderIds } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [customer.id, other.id] } },
    });
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
