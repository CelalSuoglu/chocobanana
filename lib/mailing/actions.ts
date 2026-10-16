"use server";

import { isEmailConfigured, sendAppEmail } from "@/lib/auth/email";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { verificationMessage } from "@/lib/mailing/messages";
import { joinMailingList, type JoinResult } from "@/lib/mailing/service";

export async function subscribeToMailingList(
  _prev: JoinResult | null,
  formData: FormData,
): Promise<JoinResult> {
  if (!isDatabaseConfigured()) return { ok: false, reason: "send" };
  if (!isEmailConfigured()) return { ok: false, reason: "send" };

  return joinMailingList(
    requirePrisma(),
    {
      email: String(formData.get("email") ?? ""),
      firstName: String(formData.get("firstName") ?? ""),
      marketingOptIn: formData.get("marketingOptIn") === "yes",
      verification: verificationMessage,
    },
    async (message) => {
      await sendAppEmail(message);
    },
  );
}
