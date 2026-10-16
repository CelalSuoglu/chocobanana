import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";

export const runtime = "nodejs";

const registerSchema = z.object({
  token: z.string().min(16).max(4096),
  platform: z.enum(["ios", "android"]),
  locale: z.string().max(10).optional(),
});

const removeSchema = z.object({ token: z.string().min(16).max(4096) });

/**
 * Only same-origin JSON requests from the site/app itself. Blocks cross-site
 * form posts that could attach someone else's device to a signed-in member.
 */
function isSameOriginJson(request: Request): boolean {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return false;
  }
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOriginJson(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { token, platform } = parsed.data;
  const locale = parsed.data.locale && isLocale(parsed.data.locale) ? parsed.data.locale : null;
  const data = {
    userId: session.user.id,
    platform: platform === "ios" ? ("IOS" as const) : ("ANDROID" as const),
    locale,
    lastSeenAt: new Date(),
  };

  // Upsert by token: a phone that changes accounts moves to the new member.
  await requirePrisma().pushDevice.upsert({
    where: { token },
    create: { token, ...data },
    update: data,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isSameOriginJson(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }
  const parsed = removeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  // Knowing the device token is enough to detach it (used right after sign-out).
  await requirePrisma().pushDevice.deleteMany({ where: { token: parsed.data.token } });
  return NextResponse.json({ ok: true });
}
