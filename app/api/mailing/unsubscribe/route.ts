import { NextResponse } from "next/server";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { mailingResultPage } from "@/lib/mailing/messages";
import { unsubscribeMailingList } from "@/lib/mailing/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  const ok =
    Boolean(token) &&
    isDatabaseConfigured() &&
    (await unsubscribeMailingList(requirePrisma(), token));
  const html = mailingResultPage(
    ok ? "Unsubscribed" : "Link not valid",
    ok
      ? "You won't receive mailing-list notes from Chocobanana. Your customer account, if you have one, is unchanged."
      : "This unsubscribe link is not valid.",
  );
  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
