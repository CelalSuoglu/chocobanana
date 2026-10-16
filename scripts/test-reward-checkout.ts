import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { writeFile } from "node:fs/promises";
import { makeOrderNumber } from "../lib/orders/number";
import { reconcileCustomerRewards } from "../lib/rewards/engine";

config({ path: ".env.local" });

const prisma = new PrismaClient();
const password = "RewardTest123";
const email = `reward-checkout-${Date.now()}@example.com`;

async function makeOrder(userId: string) {
  return prisma.order.create({
    data: {
      publicNumber: makeOrderNumber(),
      userId,
      stripeCheckoutSessionId: `cs_reward_${crypto.randomUUID()}`,
      paymentStatus: "PAID",
      amountTotalCadCents: 1800,
      currency: "cad",
      customerEmail: email,
    },
  });
}

function cookiesFrom(response: Response, previous = ""): string {
  const fresh = response.headers.getSetCookie?.() ?? [];
  const jar = new Map<string, string>();
  for (const part of previous.split(";").map((item) => item.trim()).filter(Boolean)) {
    const [name, ...rest] = part.split("=");
    if (name) jar.set(name, rest.join("="));
  }
  for (const cookie of fresh) {
    const [pair] = cookie.split(";");
    const [name, ...rest] = pair.split("=");
    if (name) jar.set(name.trim(), rest.join("="));
  }
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function main() {
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  });
  const orderIds: string[] = [];
  try {
    for (let i = 0; i < 5; i += 1) orderIds.push((await makeOrder(user.id)).id);
    await reconcileCustomerRewards(prisma, user.id);
    const reward = await prisma.rewardCode.findFirst({ where: { userId: user.id } });
    if (!reward) throw new Error("expected a reward code");

    const csrfResponse = await fetch("http://localhost:3000/api/auth/csrf");
    const csrf = (await csrfResponse.json()) as { csrfToken: string };
    let cookie = cookiesFrom(csrfResponse);
    const login = await fetch("http://localhost:3000/api/auth/callback/credentials", {
      method: "POST",
      redirect: "manual",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookie,
      },
      body: new URLSearchParams({
        csrfToken: csrf.csrfToken,
        email,
        password,
        callbackUrl: "http://localhost:3000/en/account",
      }),
    });
    cookie = cookiesFrom(login, cookie);
    if (!cookie.includes("session-token")) {
      throw new Error(`login did not set a session (${login.status})`);
    }

    const denied = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "chocobanana_locale=en" },
      body: JSON.stringify({
        locale: "en",
        productId: "letter-sets",
        rewardCode: reward.code,
        amountCadCents: 1,
      }),
    });
    if (denied.status !== 401) {
      throw new Error(`guest checkout with a reward code returned ${denied.status}`);
    }

    const checkout = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${cookie}; chocobanana_locale=en`,
      },
      body: JSON.stringify({
        locale: "en",
        productId: "letter-sets",
        rewardCode: reward.code,
        amountCadCents: 1,
        discountCadCents: 1,
      }),
    });
    const body = (await checkout.json()) as { url?: string; error?: string };
    if (!checkout.ok || !body.url?.includes("checkout.stripe.com")) {
      throw new Error(`checkout failed ${checkout.status} ${body.error ?? ""}`);
    }
    await writeFile("/tmp/reward-checkout-url.txt", body.url);
    console.log("checkout_created");
  } finally {
    await prisma.rewardCode.deleteMany({ where: { userId: user.id } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : "checkout test failed");
  await prisma.$disconnect();
  process.exit(1);
});
