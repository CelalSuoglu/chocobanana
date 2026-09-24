import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { isComingSoonGateActiveForRequest } from "@/lib/site-access";
import { createCheckoutSession } from "@/lib/stripe/checkout";

export const runtime = "nodejs";

type CheckoutBody = {
  productId?: unknown;
  locale?: unknown;
  items?: unknown;
};

function parseItems(
  value: unknown,
): { productId: string; quantity: number }[] | null {
  if (!Array.isArray(value)) return null;
  const items: { productId: string; quantity: number }[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const productId = (entry as { productId?: unknown }).productId;
    const quantity = (entry as { quantity?: unknown }).quantity;
    if (typeof productId !== "string" || typeof quantity !== "number") {
      continue;
    }
    items.push({ productId: productId.trim(), quantity });
  }
  return items;
}

export async function POST(request: Request) {
  if (isComingSoonGateActiveForRequest(request)) {
    return NextResponse.json(
      { error: "Checkout is unavailable while coming soon is active." },
      { status: 503 },
    );
  }

  // Never charge when orders cannot be persisted after webhook confirmation.
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Checkout is unavailable until the database is configured. Your card was not charged.",
      },
      { status: 503 },
    );
  }

  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const productId =
    typeof body.productId === "string" ? body.productId.trim() : undefined;
  const locale = typeof body.locale === "string" ? body.locale.trim() : "en";
  const items = parseItems(body.items) ?? undefined;

  if (!productId && (!items || items.length === 0)) {
    return NextResponse.json(
      { error: "productId or items is required." },
      { status: 400 },
    );
  }

  const session = await auth();

  try {
    const result = await createCheckoutSession({
      productId,
      locale,
      items,
      userId: session?.user?.id ?? null,
      customerEmail: session?.user?.email ?? null,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ url: result.url, sessionId: result.sessionId });
  } catch (error) {
    console.error("checkout.create_failed", error);
    return NextResponse.json(
      { error: "Unable to start checkout." },
      { status: 500 },
    );
  }
}
