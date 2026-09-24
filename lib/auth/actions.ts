"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { sendAppEmail } from "@/lib/auth/email";
import { createToken, hashPassword, hashToken } from "@/lib/auth/password";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/stripe/config";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  locale: z.string().min(2).max(5).optional(),
});

export type AuthActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function registerCustomer(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Accounts are not configured in this environment yet." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale") || "en",
  });
  if (!parsed.success) {
    return { ok: false, error: "Please check your name, email, and password (8+ characters)." };
  }

  const prisma = requirePrisma();
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  // Role is always CUSTOMER — never accept role from the client.
  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: "CUSTOMER",
      preferredLocale: parsed.data.locale ?? "en",
    },
  });

  const rawToken = createToken();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: hashToken(rawToken),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  const verifyUrl = `${getAppBaseUrl()}/${parsed.data.locale ?? "en"}/verify-email?token=${rawToken}`;
  await sendAppEmail({
    to: email,
    subject: "Verify your Chocobanana account",
    text: `Welcome to Chocobanana.\n\nVerify your email:\n${verifyUrl}\n`,
  });

  return {
    ok: true,
    message: "Account created. Check your email to verify before signing in.",
  };
}

export async function loginCustomer(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Accounts are not configured in this environment yet." };
  }

  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: `/${locale}/account`,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message.includes("EMAIL_NOT_VERIFIED")) {
        return { ok: false, error: "Please verify your email before signing in." };
      }
      return { ok: false, error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function loginOwner(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Accounts are not configured in this environment yet." };
  }

  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  const prisma = requirePrisma();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "OWNER") {
    return { ok: false, error: "Owner account required." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/owner",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message.includes("EMAIL_NOT_VERIFIED")) {
        return { ok: false, error: "Please verify your email before signing in." };
      }
      return { ok: false, error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function logoutCustomerAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  await signOut({ redirectTo: `/${locale}` });
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Accounts are not configured in this environment yet." };
  }

  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const locale = String(formData.get("locale") ?? "en");
  if (!email) return { ok: false, error: "Email is required." };

  const prisma = requirePrisma();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid email enumeration.
  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const rawToken = createToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashToken(rawToken),
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    const resetUrl = `${getAppBaseUrl()}/${locale}/reset-password?token=${rawToken}`;
    await sendAppEmail({
      to: email,
      subject: "Reset your Chocobanana password",
      text: `Reset your password:\n${resetUrl}\n\nThis link expires in one hour.`,
    });
  }

  return {
    ok: true,
    message: "If that email exists, a reset link has been sent.",
  };
}

export async function resetPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Accounts are not configured in this environment yet." };
  }

  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!token || password.length < 8) {
    return { ok: false, error: "Invalid token or password (8+ characters)." };
  }

  const prisma = requirePrisma();
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashToken(token) },
  });
  if (!record || record.expires < new Date()) {
    return { ok: false, error: "This reset link is invalid or expired." };
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash: await hashPassword(password) },
  });
  await prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } });

  return { ok: true, message: "Password updated. You can sign in now." };
}

export async function verifyEmailToken(token: string): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Accounts are not configured in this environment yet." };
  }
  if (!token) return { ok: false, error: "Missing verification token." };

  const prisma = requirePrisma();
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashToken(token) },
  });
  if (!record || record.expires < new Date()) {
    return { ok: false, error: "This verification link is invalid or expired." };
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { userId: record.userId } });

  return { ok: true, message: "Email verified. You can sign in." };
}
