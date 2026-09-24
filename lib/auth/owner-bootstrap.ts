"use server";

import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";

const bootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(128),
  name: z.string().trim().min(1).max(80),
  bootstrapSecret: z.string().min(16),
});

export type BootstrapState = {
  ok: boolean;
  error?: string;
  message?: string;
};

/**
 * Creates the first OWNER account when none exists.
 * Requires OWNER_BOOTSTRAP_SECRET — never exposed to client bundles.
 */
export async function bootstrapOwner(
  _prev: BootstrapState,
  formData: FormData,
): Promise<BootstrapState> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "DATABASE_URL is not configured." };
  }

  const expected = process.env.OWNER_BOOTSTRAP_SECRET?.trim();
  if (!expected) {
    return { ok: false, error: "OWNER_BOOTSTRAP_SECRET is not set." };
  }

  const parsed = bootstrapSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    bootstrapSecret: formData.get("bootstrapSecret"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input. Password must be at least 12 characters.",
    };
  }

  if (parsed.data.bootstrapSecret !== expected) {
    return { ok: false, error: "Invalid bootstrap secret." };
  }

  const prisma = requirePrisma();
  const owners = await prisma.user.count({ where: { role: "OWNER" } });
  if (owners > 0) {
    return {
      ok: false,
      error: "An owner already exists. Bootstrap is disabled.",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "That email is already registered." };
  }

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      role: "OWNER",
      emailVerified: new Date(),
    },
  });

  return {
    ok: true,
    message: "Owner account created. Sign in at /en/sign-in, then open /owner.",
  };
}
