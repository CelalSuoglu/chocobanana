import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCatalogProduct, isRewardDiscountProduct } from "@/lib/catalog/products";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { quoteRewardCode } from "@/lib/rewards/engine";
import { isComingSoonGateActiveForRequest } from "@/lib/site-access";

export const runtime = "nodejs";

type QuoteBody = {
  code?: unknown;
  items?: unknown;
  productId?: unknown;
  discount?: unknown;
  discountCadCents?: unknown;
  amount?: unknown;
  amountCadCents?: unknown;
};

function parseItems(value: unknown): { productId: string; quantity: number }[] {
  if (!Array.isArray(value)) return [];
  const items: { productId: string; quantity: number }[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const productId = (entry as { productId?: unknown }).productId;
    const quantity = (entry as { quantity?: unknown }).quantity;
    if (typeof productId !== "string" || typeof quantity !== "number") continue;
    const qty = Math.min(99, Math.max(0, Math.floor(quantity)));
    if (!productId.trim() || qty <= 0) continue;
    items.push({ productId: productId.trim(), quantity: qty });
  }
  return items;
}

export async function POST(request: Request) {
  if (await isComingSoonGateActiveForRequest(request)) {
    return NextResponse.json({ error: "reward_signin" }, { status: 503 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "reward_invalid" }, { status: 503 });
  }

  let body: QuoteBody;
  try {
    body = (await request.json()) as QuoteBody;
  } catch {
    return NextResponse.json({ error: "reward_invalid" }, { status: 400 });
  }

  void body.discount;
  void body.discountCadCents;
  void body.amount;
  void body.amountCadCents;

  const session = await auth();
  const code = typeof body.code === "string" ? body.code : "";
  const items = parseItems(body.items);
  if (items.length === 0 && typeof body.productId === "string" && body.productId.trim()) {
    items.push({ productId: body.productId.trim(), quantity: 1 });
  }

  let subtotalCadCents = 0;
  for (const item of items) {
    const product = getCatalogProduct(item.productId);
    if (!product || !product.purchasable || !isRewardDiscountProduct(product)) {
      return NextResponse.json({ error: "reward_invalid" }, { status: 400 });
    }
    subtotalCadCents += product.amountCadCents * item.quantity;
  }

  const quote = await quoteRewardCode(requirePrisma(), {
    code,
    userId: session?.user?.id ?? null,
    subtotalCadCents,
  });
  if (!quote.ok) {
    const status = quote.error === "reward_signin" ? 401 : 400;
    return NextResponse.json({ error: quote.error }, { status });
  }

  return NextResponse.json({
    code: quote.code,
    percentOff: quote.percentOff,
    subtotalCadCents: quote.subtotalCadCents,
    discountCadCents: quote.discountCadCents,
    totalCadCents: quote.totalCadCents,
  });
}
