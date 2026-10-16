"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, signOut } from "@/auth";
import { verifyPassword } from "@/lib/auth/password";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getStripe } from "@/lib/stripe/client";
import { getPaymentsMode } from "@/lib/stripe/config";

export type DeleteAccountState = {
  ok: boolean;
  error?: "password" | "confirm" | "billing" | "owner" | "unavailable" | "generic";
};

const schema = z.object({
  password: z.string().min(1).max(128),
  confirm: z.literal("yes"),
  locale: z.string().max(5).optional(),
});

/**
 * Permanently deletes the signed-in customer's account (App Store guideline
 * 5.1.1(v) / Google Play account deletion). Requires the current password.
 *
 * Removed: profile, address, login sessions, reward codes, Mail Club
 * subscription rows, app push devices, mailing-list entry, Stripe customer
 * (saved cards). Kept without the account link: paid orders, which the shop
 * must keep for tax and accounting.
 */
export async function deleteCustomerAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "generic" };
  if (!isDatabaseConfigured()) return { ok: false, error: "unavailable" };

  const parsed = schema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
    locale: formData.get("locale") ?? undefined,
  });
  if (!parsed.success) {
    const confirmMissing = formData.get("confirm") !== "yes";
    return { ok: false, error: confirmMissing ? "confirm" : "password" };
  }

  const locale = parsed.data.locale && isLocale(parsed.data.locale) ? parsed.data.locale : "en";
  const prisma = requirePrisma();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, passwordHash: true, stripeCustomerId: true },
  });
  if (!user) return { ok: false, error: "generic" };
  // The shop owner account runs the panel; it is never removed from here.
  if (user.role !== "CUSTOMER") return { ok: false, error: "owner" };

  const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordOk) return { ok: false, error: "password" };

  // Stop any recurring billing before the account disappears.
  const openSubscriptions = await prisma.mailClubSubscription.findMany({
    where: { userId: user.id, status: { not: "CANCELED" } },
    select: { stripeSubscriptionId: true },
  });
  const stripeEnabled = getPaymentsMode() !== "disabled";
  if (openSubscriptions.length > 0 && !stripeEnabled) {
    return { ok: false, error: "billing" };
  }
  if (stripeEnabled) {
    try {
      const stripe = getStripe();
      for (const sub of openSubscriptions) {
        try {
          await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
        } catch (error) {
          const code = (error as { code?: string }).code;
          if (code !== "resource_missing") throw error;
        }
      }
      if (user.stripeCustomerId) {
        try {
          // Removes saved payment methods; past payments stay in Stripe's records.
          await stripe.customers.del(user.stripeCustomerId);
        } catch (error) {
          const code = (error as { code?: string }).code;
          if (code !== "resource_missing") throw error;
        }
      }
    } catch (error) {
      console.error("account.delete_billing_failed", error instanceof Error ? error.name : "unknown");
      return { ok: false, error: "billing" };
    }
  }

  try {
    await prisma.$transaction([
      prisma.emailSubscriber.deleteMany({ where: { email: user.email } }),
      // Cascades: sessions, tokens, reward codes, subscriptions, push devices.
      // Orders keep their snapshot and lose the account link (onDelete: SetNull).
      prisma.user.delete({ where: { id: user.id } }),
    ]);
  } catch (error) {
    console.error("account.delete_failed", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "generic" };
  }

  await signOut({ redirect: false });
  redirect(`/${locale}/account-deleted`);
}
