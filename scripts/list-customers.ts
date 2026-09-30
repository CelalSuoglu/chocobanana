import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      stripeCustomerId: true,
      _count: { select: { orders: true, rewardCodes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  for (const user of users) {
    console.log(
      [
        user.email,
        user.firstName ?? "",
        user.lastName ?? "",
        `orders=${user._count.orders}`,
        `codes=${user._count.rewardCodes}`,
        user.stripeCustomerId ? "stripe=yes" : "stripe=no",
      ].join(" | "),
    );
  }
  await prisma.$disconnect();
}

main();
