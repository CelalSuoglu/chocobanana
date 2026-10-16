import { NextResponse } from "next/server";
import { isEmailConfigured, sendAppEmail } from "@/lib/auth/email";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { listWelcomeMessage, mailingResultPage } from "@/lib/mailing/messages";
import { confirmMailingList } from "@/lib/mailing/service";

export const runtime = "nodejs";

function page(title: string, body: string, status = 200) {
  return new NextResponse(mailingResultPage(title, body), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token || !isDatabaseConfigured()) {
    return page("Link not valid", "This confirmation link is not valid.", 400);
  }

  const result = await confirmMailingList(
    requirePrisma(),
    token,
    listWelcomeMessage,
    async (message) => {
      if (!isEmailConfigured()) throw new Error("EMAIL_NOT_CONFIGURED");
      await sendAppEmail(message);
    },
  );

  if (!result.ok) {
    return page("Link not valid", "This confirmation link is not valid.", 400);
  }
  if (!result.welcomed) {
    return page(
      "You're confirmed",
      "Your email is confirmed, but the welcome note could not be sent. Open this link again in a little while.",
    );
  }
  return page(
    "You're on the list",
    "Your email is confirmed. A welcome note is on its way. This list is not a customer account.",
  );
}
