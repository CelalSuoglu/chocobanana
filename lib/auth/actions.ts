"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { sendAppEmail, isEmailConfigured, formatEmailErrorForUser } from "@/lib/auth/email";
import { createToken, hashPassword, hashToken } from "@/lib/auth/password";
import {
  clientIp,
  issuePasswordReset,
  passwordMeetsRules,
  passwordResetAllowed,
  passwordResetTokenIsValid,
  recordPasswordResetAttempt,
} from "@/lib/auth/password-reset";
import {
  assertSignupCountry,
  displayName,
  normalizePhone,
} from "@/lib/auth/profile";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { sendWelcomeEmail } from "@/lib/welcome/email";

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

  const emailReady = isEmailConfigured();

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
      marketingOptIn: formData.get("marketingOptIn") === "yes",
      // Without a mail provider, the account can sign in immediately.
      // When email is configured, sign-in waits for the verification link.
      emailVerified: emailReady ? null : new Date(),
    },
  });

  if (!emailReady) {
    revalidatePath("/owner");
    revalidatePath("/owner/members");
    const locale = isLocale(parsed.data.locale ?? "")
      ? parsed.data.locale!
      : "en";
    const dict = await getDictionary(locale);
    return {
      ok: true,
      message: dict.auth.signUpWelcome,
    };
  }

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

  const locale = isLocale(parsed.data.locale ?? "")
    ? parsed.data.locale!
    : "en";
  const dict = await getDictionary(locale);
  return {
    ok: true,
    message: dict.auth.signUpCheckEmail,
  };
}

export async function updateCustomerProfile(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const localeRaw = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeRaw) ? localeRaw : "en";
  const dict = await getDictionary(locale);

  if (!isDatabaseConfigured()) {
    console.error("profile_update_unavailable");
    return { ok: false, error: dict.account.profileInvalid };
  }

  const session = await auth();
  if (!session?.user?.id || session.user.role === "OWNER") {
    console.error("profile_update_forbidden");
    return { ok: false, error: dict.account.profileInvalid };
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
    console.error("profile_update_invalid");
    return {
      ok: false,
      error: dict.account.profileInvalid,
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

  revalidatePath(`/${locale}/account`);
  return { ok: true, message: dict.account.savedToast };
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
  const localeRaw = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeRaw) ? localeRaw : "en";
  const dict = await getDictionary(locale);

  if (!isDatabaseConfigured()) {
    return { ok: false, error: dict.auth.notConfigured };
  }

  if (!isEmailConfigured()) {
    return { ok: false, error: dict.auth.emailSetupRequired };
  }

  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email || !z.string().email().safeParse(email).success) {
    return { ok: false, error: dict.auth.resetEmailInvalid };
  }

  const ip = await clientIp();
  if (!(await passwordResetAllowed(email, ip))) {
    return { ok: false, error: dict.auth.resetWait };
  }
  await recordPasswordResetAttempt(email, ip);

  const prisma = requirePrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  // Same success whether the address exists. A failed send is logged, not revealed.
  if (user) {
    await issuePasswordReset({ userId: user.id, email, locale });
  }

  return { ok: true, message: dict.auth.resetSent };
}

export async function resetPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const localeRaw = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeRaw) ? localeRaw : "en";
  const dict = await getDictionary(locale);

  if (!isDatabaseConfigured()) {
    return { ok: false, error: dict.auth.notConfigured };
  }

  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!(await passwordResetTokenIsValid(token))) {
    return { ok: false, error: dict.auth.resetInvalid };
  }
  if (password !== confirm) {
    return { ok: false, error: dict.auth.resetMismatch };
  }
  if (!passwordMeetsRules(password)) {
    return { ok: false, error: dict.auth.resetRules };
  }

  const prisma = requirePrisma();
  const hashed = hashToken(token);
  const passwordHash = await hashPassword(password);

  try {
    await prisma.$transaction(async (tx) => {
      const record = await tx.passwordResetToken.findUnique({
        where: { token: hashed },
      });
      if (!record || record.expires < new Date()) {
        throw new Error("invalid_reset_token");
      }
      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });
      await tx.session.deleteMany({ where: { userId: record.userId } });
      await tx.passwordResetToken.deleteMany({ where: { userId: record.userId } });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_reset_token") {
      return { ok: false, error: dict.auth.resetInvalid };
    }
    console.error(
      "password_reset.update_failed",
      error instanceof Error ? error.name : "update_failed",
    );
    return { ok: false, error: dict.auth.resetInvalid };
  }

  return { ok: true, message: dict.auth.resetUpdated };
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
  await sendWelcomeEmail(record.userId);

  return { ok: true, message: "Email verified. You can sign in." };
}
