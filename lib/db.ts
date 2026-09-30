import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function createPrismaClient() {
  return new PrismaClient();
}

export function getPrisma(): PrismaClient | null {
  if (!isDatabaseConfigured()) return null;

  // Dev HMR can keep a PrismaClient from before schema changes (missing models).
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    (typeof (cached as PrismaClient & { mailClubSubscription?: unknown })
      .mailClubSubscription === "undefined" ||
      typeof (cached as PrismaClient & { rewardCode?: unknown }).rewardCode ===
        "undefined" ||
      typeof (cached as PrismaClient & { publicSiteOpening?: unknown })
        .publicSiteOpening === "undefined" ||
      typeof (cached as PrismaClient & { rewardCodeRedemption?: unknown })
        .rewardCodeRedemption === "undefined")
  ) {
    void cached.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export function requirePrisma(): PrismaClient {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return prisma;
}
