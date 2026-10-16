import { createHash, randomBytes } from "crypto";
import type { Prisma, PrismaClient } from "@prisma/client";

type MailDb = PrismaClient | Prisma.TransactionClient;

export type MailSend = (options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) => Promise<void>;

export type JoinResult =
  | { ok: true }
  | { ok: false; reason: "consent" | "email" | "already" | "pending" | "send" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function mailingToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashMailingToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function joinMailingList(
  db: MailDb,
  input: {
    email: string;
    firstName?: string | null;
    marketingOptIn: boolean;
    verification: (rawToken: string) => { subject: string; text: string; html: string };
  },
  send: MailSend,
): Promise<JoinResult> {
  if (!input.marketingOptIn) return { ok: false, reason: "consent" };
  const email = normalizeEmail(input.email);
  const firstName = input.firstName?.trim().slice(0, 60) || null;
  if (!EMAIL_PATTERN.test(email) || email.length > 180) {
    return { ok: false, reason: "email" };
  }

  const existing = await db.emailSubscriber.findUnique({ where: { email } });
  if (existing?.status === "CONFIRMED") return { ok: false, reason: "already" };
  if (existing?.status === "PENDING" && existing.verificationSentAt) {
    return { ok: false, reason: "pending" };
  }

  const rawToken = mailingToken();
  const unsubscribeToken = mailingToken();
  const data = {
    email,
    firstName,
    marketingOptIn: true,
    status: "PENDING" as const,
    verificationTokenHash: hashMailingToken(rawToken),
    unsubscribeTokenHash: hashMailingToken(unsubscribeToken),
    verificationSentAt: null,
    verifiedAt: null,
    unsubscribedAt: null,
    welcomeEmailSentAt: null,
  };

  const row = existing
    ? await db.emailSubscriber.update({ where: { id: existing.id }, data })
    : await db.emailSubscriber.create({ data });

  const message = input.verification(rawToken);
  try {
    await send({ to: email, ...message });
  } catch {
    if (existing) {
      await db.emailSubscriber.update({
        where: { id: existing.id },
        data: {
          firstName: existing.firstName,
          marketingOptIn: existing.marketingOptIn,
          status: existing.status,
          verificationTokenHash: existing.verificationTokenHash,
          unsubscribeTokenHash: existing.unsubscribeTokenHash,
          verificationSentAt: existing.verificationSentAt,
          verifiedAt: existing.verifiedAt,
          welcomeEmailSentAt: existing.welcomeEmailSentAt,
          unsubscribedAt: existing.unsubscribedAt,
        },
      });
    } else {
      await db.emailSubscriber.delete({ where: { id: row.id } });
    }
    return { ok: false, reason: "send" };
  }

  await db.emailSubscriber.update({
    where: { id: row.id },
    data: { verificationSentAt: new Date() },
  });
  return { ok: true };
}

export async function confirmMailingList(
  db: MailDb,
  token: string,
  welcome: (row: { email: string; firstName: string | null; unsubscribeToken: string }) => {
    subject: string;
    text: string;
    html: string;
  },
  send: MailSend,
): Promise<{ ok: true; welcomed: boolean } | { ok: false }> {
  const hash = hashMailingToken(token);
  const row = await db.emailSubscriber.findUnique({
    where: { verificationTokenHash: hash },
  });
  if (!row || row.status === "UNSUBSCRIBED" || !row.unsubscribeTokenHash) {
    return { ok: false };
  }

  if (row.status !== "CONFIRMED") {
    await db.emailSubscriber.update({
      where: { id: row.id },
      data: { status: "CONFIRMED", verifiedAt: new Date() },
    });
  }

  if (row.welcomeEmailSentAt) return { ok: true, welcomed: true };

  const claimed = await db.emailSubscriber.updateMany({
    where: { id: row.id, welcomeEmailSentAt: null },
    data: { welcomeEmailSentAt: new Date() },
  });
  if (claimed.count !== 1) return { ok: true, welcomed: true };

  const unsubscribeToken = mailingToken();
  await db.emailSubscriber.update({
    where: { id: row.id },
    data: { unsubscribeTokenHash: hashMailingToken(unsubscribeToken) },
  });

  try {
    const message = welcome({
      email: row.email,
      firstName: row.firstName,
      unsubscribeToken,
    });
    await send({ to: row.email, ...message });
  } catch {
    await db.emailSubscriber.update({
      where: { id: row.id },
      data: { welcomeEmailSentAt: null },
    });
    return { ok: true, welcomed: false };
  }

  await db.emailSubscriber.update({
    where: { id: row.id },
    data: { verificationTokenHash: null },
  });
  return { ok: true, welcomed: true };
}

export async function unsubscribeMailingList(
  db: MailDb,
  token: string,
): Promise<boolean> {
  const updated = await db.emailSubscriber.updateMany({
    where: { unsubscribeTokenHash: hashMailingToken(token) },
    data: {
      status: "UNSUBSCRIBED",
      marketingOptIn: false,
      unsubscribedAt: new Date(),
      verificationTokenHash: null,
    },
  });
  return updated.count === 1;
}

export async function listEmailSubscribers(db: MailDb) {
  return db.emailSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      firstName: true,
      status: true,
      verifiedAt: true,
      createdAt: true,
    },
  });
}
