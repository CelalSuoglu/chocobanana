import { PrismaClient } from "@prisma/client";
import type { DeliveryDetails } from "../lib/checkout/address";
import { makeOrderNumber } from "../lib/orders/number";
import { createCheckoutSession } from "../lib/stripe/checkout";
import { getStripe } from "../lib/stripe/client";
import {
  attachWelcomeReservation,
  chooseCheckoutDiscount,
  claimOrderConfirmationSend,
  claimWelcomeEmailSend,
  consumeWelcomeDiscount,
  readWelcomeDiscount,
  releaseWelcomeEmailClaim,
  releaseWelcomeReservation,
} from "../lib/welcome/discount";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error(label);
}

const delivery: DeliveryDetails = {
  firstName: "Ada",
  lastName: "Welcome",
  email: "welcome-check@example.com",
  country: "CA",
  line1: "1 Example Street",
  line2: "",
  city: "Montreal",
  region: "QC",
  postalCode: "H2X 1Y4",
  phone: "+15145550100",
};

async function main() {
  assert(
    chooseCheckoutDiscount({ rewardCode: "CB-TEST", welcomeEligible: true }) === "reward",
    "reward_and_welcome_must_not_stack",
  );
  assert(
    chooseCheckoutDiscount({ rewardCode: "  ", welcomeEligible: true }) === "welcome",
    "blank_code_uses_welcome",
  );
  assert(
    chooseCheckoutDiscount({ welcomeEligible: false }) === "none",
    "guest_gets_no_welcome_discount",
  );

  const prisma = new PrismaClient();
  const stamp = Date.now();
  const user = await prisma.user.create({
    data: {
      email: `welcome-check-${stamp}@example.com`,
      passwordHash: "not-a-login",
      firstName: "Ada",
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  });

  try {
    assert(user.marketingOptIn === false, "marketing_starts_unchecked");
    const first = await readWelcomeDiscount(prisma, user.id);
    assert(first.eligible, "new_member_is_eligible");

    const held = await attachWelcomeReservation(prisma, user.id, `cs_hold_${stamp}`, null);
    assert(held, "reservation_holds_discount");
    await releaseWelcomeReservation(prisma, `cs_hold_${stamp}`);
    const afterCancel = await prisma.user.findUnique({ where: { id: user.id } });
    assert(afterCancel?.welcomeDiscountUsedAt == null, "cancel_does_not_consume");
    assert((await readWelcomeDiscount(prisma, user.id)).eligible, "cancel_stays_eligible");

    const again = await attachWelcomeReservation(prisma, user.id, `cs_paid_${stamp}`, null);
    assert(again, "second_hold");
    assert(await consumeWelcomeDiscount(prisma, user.id, `cs_paid_${stamp}`), "paid_consumes_once");
    assert(!(await consumeWelcomeDiscount(prisma, user.id, `cs_paid_${stamp}`)), "second_consume_blocked");
    await releaseWelcomeReservation(prisma, `cs_paid_${stamp}`);
    const used = await prisma.user.findUnique({ where: { id: user.id } });
    assert(used?.welcomeDiscountUsedAt != null, "release_after_pay_keeps_used");
    assert(!(await readWelcomeDiscount(prisma, user.id)).eligible, "used_discount_not_eligible");

    assert(await claimWelcomeEmailSend(prisma, user.id), "welcome_email_claimed_once");
    assert(!(await claimWelcomeEmailSend(prisma, user.id)), "welcome_email_not_sent_twice");
    await releaseWelcomeEmailClaim(prisma, user.id);
    assert(await claimWelcomeEmailSend(prisma, user.id), "failed_send_can_retry");

    const guestOrder = await prisma.order.create({
      data: {
        publicNumber: makeOrderNumber(),
        stripeCheckoutSessionId: `cs_guest_${stamp}`,
        customerEmail: `guest-${stamp}@example.com`,
        amountTotalCadCents: 1200,
        userId: null,
      },
    });
    assert(await claimOrderConfirmationSend(prisma, guestOrder.id), "guest_confirmation_once");
    assert(!(await claimOrderConfirmationSend(prisma, guestOrder.id)), "guest_confirmation_not_twice");
    await prisma.order.delete({ where: { id: guestOrder.id } });

    await prisma.user.update({
      where: { id: user.id },
      data: { welcomeDiscountUsedAt: null, welcomeReservedSessionId: null, welcomeEmailSentAt: null },
    });
    const session = await createCheckoutSession({
      locale: "en",
      items: [{ productId: "letter-sets", quantity: 1 }],
      userId: user.id,
      customerEmail: user.email,
      delivery: { ...delivery, email: user.email },
    });
    if (!session.ok) throw new Error(`stripe_session_failed:${session.error}`);
    const stripe = getStripe();
    const saved = await stripe.checkout.sessions.retrieve(session.sessionId);
    const total = saved.amount_total;
    console.log(
      JSON.stringify({
        welcome: saved.metadata?.welcome_discount ?? "",
        reward: saved.metadata?.reward_code_id ? "set" : "",
        promotionCodes: Boolean(saved.allow_promotion_codes),
        total,
        expectedTotal: 1620,
      }),
    );
    assert(saved.metadata?.welcome_discount === "1", "stripe_welcome_flag");
    assert(!saved.metadata?.reward_code_id, "stripe_no_second_discount");
    assert(saved.allow_promotion_codes !== true, "stripe_blocks_extra_codes");
    assert(total === 1620, "stripe_total_is_ten_percent_off");
    await stripe.checkout.sessions.expire(session.sessionId);
    await releaseWelcomeReservation(prisma, session.sessionId);
    const afterExpire = await prisma.user.findUnique({ where: { id: user.id } });
    assert(afterExpire?.welcomeDiscountUsedAt == null, "expired_stripe_session_does_not_consume");
    if (typeof saved.customer === "string") {
      await stripe.customers.del(saved.customer);
    }
  } finally {
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "welcome check failed");
  process.exit(1);
});
