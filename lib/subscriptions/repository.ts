import "server-only";
import type { MailClubSubscriptionStatus, Prisma } from "@prisma/client";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";

export async function getMailClubSubscriptionForUser(userId: string) {
  if (!isDatabaseConfigured()) return null;
  const prisma = requirePrisma();
  return prisma.mailClubSubscription.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listMailClubSubscriptions(filters: {
  status?: MailClubSubscriptionStatus | "ALL";
} = {}) {
  const prisma = requirePrisma();
  const where: Prisma.MailClubSubscriptionWhereInput = {};
  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  return prisma.mailClubSubscription.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          region: true,
          postalCode: true,
          country: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
}

function mapStripeStatus(
  status: string | null | undefined,
): MailClubSubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "paused":
      return "PAUSED";
    case "canceled":
      return "CANCELED";
    case "past_due":
      return "PAST_DUE";
    case "incomplete":
    case "incomplete_expired":
    case "trialing":
    case "unpaid":
    default:
      if (status === "trialing") return "ACTIVE";
      return "INCOMPLETE";
  }
}

export async function upsertMailClubSubscription(options: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const prisma = requirePrisma();
  const status = mapStripeStatus(options.status);
  return prisma.mailClubSubscription.upsert({
    where: { stripeSubscriptionId: options.stripeSubscriptionId },
    create: {
      userId: options.userId,
      stripeCustomerId: options.stripeCustomerId,
      stripeSubscriptionId: options.stripeSubscriptionId,
      status,
      currentPeriodEnd: options.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: options.cancelAtPeriodEnd ?? false,
    },
    update: {
      userId: options.userId,
      stripeCustomerId: options.stripeCustomerId,
      status,
      currentPeriodEnd: options.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: options.cancelAtPeriodEnd ?? false,
    },
  });
}

export async function countActiveMailClubSubscriptions() {
  const prisma = requirePrisma();
  return prisma.mailClubSubscription.count({ where: { status: "ACTIVE" } });
}
