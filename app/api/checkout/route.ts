import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe/checkout";

export const runtime = "nodejs";

type CheckoutBody = {
  productId?: unknown;
  locale?: unknown;
};

export async function POST(request: Request) {
  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const productId =
    typeof body.productId === "string" ? body.productId.trim() : "";
  const locale = typeof body.locale === "string" ? body.locale.trim() : "en";

  if (!productId) {
    return NextResponse.json({ error: "productId is required." }, { status: 400 });
  }

  try {
    const result = await createCheckoutSession({ productId, locale });
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
