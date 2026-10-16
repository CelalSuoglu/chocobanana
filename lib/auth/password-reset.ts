import "server-only";

import { headers } from "next/headers";
import { createToken, hashToken } from "@/lib/auth/password";
import { sendAppEmail } from "@/lib/auth/email";
import { requirePrisma } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/stripe/config";

const CLUB_URL = "https://thechocobananaclub.com";

/** Single-use reset links stay valid for 30 minutes. */
export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

const RATE_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_LIMIT = 3;
const IP_LIMIT = 8;

export function passwordMeetsRules(password: string): boolean {
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    /\p{L}/u.test(password) &&
    /\p{N}/u.test(password)
  );
}

export async function clientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerList.get("x-real-ip")?.trim() || "unknown";
}

function buckets(email: string, ip: string) {
  return {
    email: `e:${hashToken(email)}`,
    ip: `i:${hashToken(ip)}`,
  };
}

export async function passwordResetAllowed(
  email: string,
  ip: string,
): Promise<boolean> {
  const prisma = requirePrisma();
  const since = new Date(Date.now() - RATE_WINDOW_MS);
  const keys = buckets(email, ip);
  await prisma.passwordResetAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  const [emailCount, ipCount] = await Promise.all([
    prisma.passwordResetAttempt.count({
      where: { bucket: keys.email, createdAt: { gte: since } },
    }),
    prisma.passwordResetAttempt.count({
      where: { bucket: keys.ip, createdAt: { gte: since } },
    }),
  ]);
  return emailCount < EMAIL_LIMIT && ipCount < IP_LIMIT;
}

export async function recordPasswordResetAttempt(
  email: string,
  ip: string,
): Promise<void> {
  const prisma = requirePrisma();
  const keys = buckets(email, ip);
  await prisma.passwordResetAttempt.createMany({
    data: [{ bucket: keys.email }, { bucket: keys.ip }],
  });
}

export async function passwordResetTokenIsValid(rawToken: string): Promise<boolean> {
  const token = rawToken.trim();
  if (!token) return false;
  const prisma = requirePrisma();
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashToken(token) },
    select: { expires: true },
  });
  return Boolean(record && record.expires > new Date());
}

function resetEmail(resetUrl: string): { text: string; html: string } {
  const text = [
    "Reset your Chocobanana password.",
    "",
    resetUrl,
    "",
    "This link works once and expires in 30 minutes.",
    "If you did not ask for this, you can ignore the email.",
    "",
    "With love,",
    "Didem",
    "Chocobanana",
  ].join("\n");
  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#FFF4CC;color:#4B281B;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#FFFBEE;border:1px solid #E5D3A8;border-radius:16px;">
    <tr><td style="padding:28px 24px;font-size:16px;line-height:1.6;">
      <p style="margin:0 0 16px;"><img src="${CLUB_URL}/logo.jpg" alt="Chocobanana" width="72" height="72" style="border-radius:999px;display:block;"></p>
      <p style="margin:0 0 16px;">Reset your Chocobanana password.</p>
      <p style="margin:24px 0 8px;"><a href="${resetUrl}" style="display:inline-block;background:#4B281B;color:#FFFBEE;text-decoration:none;padding:12px 20px;border-radius:999px;font-family:Georgia,serif;">Choose a new password</a></p>
      <p style="margin:16px 0 0;font-size:14px;">This link works once and expires in 30 minutes. If you did not ask for this, you can ignore the email.</p>
      <p style="margin:24px 0 0;">With love,<br>Didem<br>Chocobanana</p>
    </td></tr>
  </table>
</body>
</html>`;
  return { text, html };
}

export async function issuePasswordReset(options: {
  userId: string;
  email: string;
  locale: string;
}): Promise<void> {
  const prisma = requirePrisma();
  const rawToken = createToken();
  await prisma.passwordResetToken.deleteMany({ where: { userId: options.userId } });
  await prisma.passwordResetToken.create({
    data: {
      userId: options.userId,
      token: hashToken(rawToken),
      expires: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  });
  const resetUrl = `${getAppBaseUrl()}/${options.locale}/reset-password?token=${rawToken}`;
  const message = resetEmail(resetUrl);
  try {
    await sendAppEmail({
      to: options.email,
      subject: "Reset your Chocobanana password",
      text: message.text,
      html: message.html,
    });
  } catch (error) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: options.userId } });
    console.error(
      "password_reset.send_failed",
      error instanceof Error ? error.name : "send_failed",
    );
  }
}
