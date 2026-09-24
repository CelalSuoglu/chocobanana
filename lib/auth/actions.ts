"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { sendAppEmail, isEmailConfigured, formatEmailErrorForUser } from "@/lib/auth/email";
import { createToken, hashPassword, hashToken } from "@/lib/auth/password";
import {
  assertSignupCountry,
  displayName,
  normalizePhone,
} from "@/lib/auth/profile";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const addressFields = {
  addressLine1: z.string().trim().min(1).max(120),
  addressLine2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(1).max(80),
  region: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(2).max(24),
  country: z.string().trim().length(2),
};

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().email(),
  phone: z.string().trim().min(7).max(32),
  password: z.string().min(8).max(128),
  ...addressFields,
  locale: z.string().min(2).max(5).optional(),
});

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z.string().trim().min(7).max(32),
  ...addressFields,
  locale: z.string().min(2).max(5).optional(),
});

export type AuthActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

function parseOptionalLine(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw || undefined;
}

export async function registerCustomer(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Accounts are not configured in this environment yet." };
  }

  if (!isEmailConfigured()) {
    return {
      ok: false,
      error:
        "[EMAIL_NOT_CONFIGURED] Email delivery needs RESEND_API_KEY and EMAIL_FROM (verified domain). Registration is unavailable until email is set up.",
    };
  }

  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: parseOptionalLine(formData.get("addressLine2")),
    city: formData.get("city"),
    region: formData.get("region"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    locale: formData.get("locale") || "en",
  });

  const phone = parsed.success ? normalizePhone(parsed.data.phone) : null;
  if (!parsed.success || !phone || !assertSignupCountry(parsed.data.country)) {
    return {
      ok: false,
      error:
        "Please check first/last name, email, phone (+country code), password (8+), and full address.",
    };
  }

  const prisma = requirePrisma();
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const fullName = displayName(parsed.data.firstName, parsed.data.lastName);

  // Role is always CUSTOMER — never accept role from the client.
  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      name: fullName,
      email,
      phone,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 ?? null,
      city: parsed.data.city,
      region: parsed.data.region,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country.toUpperCase(),
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
  try {
    await sendAppEmail({
      to: email,
      subject: "Verify your Chocobanana account",
      text: `Welcome to Chocobanana.\n\nVerify your email:\n${verifyUrl}\n`,
    });
  } catch (error) {
    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    return {
      ok: false,
      error: formatEmailErrorForUser(error),
    };
  }

  revalidatePath("/owner");
  revalidatePath("/owner/members");

  return {
    ok: true,
    message: "Account created. Check your email to verify before signing in.",
  };
}

export async function updateCustomerProfile(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Accounts are not configured in this environment yet." };
  }

  const session = await auth();
  if (!session?.user?.id || session.user.role === "OWNER") {
    return { ok: false, error: "You must be signed in as a customer." };
  }

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: parseOptionalLine(formData.get("addressLine2")),
    city: formData.get("city"),
    region: formData.get("region"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    locale: formData.get("locale") || "en",
  });
  const phone = parsed.success ? normalizePhone(parsed.data.phone) : null;
  if (!parsed.success || !phone || !assertSignupCountry(parsed.data.country)) {
    return {
      ok: false,
      error: "Please check your profile and address fields.",
    };
  }

  const prisma = requirePrisma();
  // Customers can only update their own row.
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      name: displayName(parsed.data.firstName, parsed.data.lastName),
      phone,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 ?? null,
      city: parsed.data.city,
      region: parsed.data.region,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country.toUpperCase(),
      preferredLocale: parsed.data.locale ?? "en",
    },
  });

  const locale = parsed.data.locale ?? "en";
  revalidatePath(`/${locale}/account`);
  return { ok: true, message: "Profile saved." };
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

/** Ends the Auth.js session and returns to owner login (not the customer shop). */
export async function logoutOwnerAction() {
  await signOut({ redirectTo: "/owner/login" });
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Accounts are not configured in this environment yet." };
  }

  if (!isEmailConfigured()) {
    return {
      ok: false,
      error:
        "[EMAIL_NOT_CONFIGURED] Password reset needs RESEND_API_KEY and EMAIL_FROM (verified domain).",
    };
  }

  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const locale = String(formData.get("locale") ?? "en");
  if (!email) return { ok: false, error: "Email is required." };

  const prisma = requirePrisma();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid email enumeration when send succeeds or user missing.
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
    try {
      await sendAppEmail({
        to: email,
        subject: "Reset your Chocobanana password",
        text: `Reset your password:\n${resetUrl}\n\nThis link expires in one hour.`,
      });
    } catch (error) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      return {
        ok: false,
        error: formatEmailErrorForUser(error).replace(
          "Account was not created.",
          "Reset email was not sent.",
        ),
      };
    }
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
