import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";
import { getAppBaseUrl, getPaymentsMode } from "@/lib/stripe/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (getPaymentsMode() === "disabled" || !isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Billing portal is not available." },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user?.id || session.user.role === "OWNER") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let locale = "en";
  try {
    const body = (await request.json()) as { locale?: string };
    if (body.locale) locale = body.locale;
  } catch {
    // optional body
  }

  const user = await requirePrisma().user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer on this account yet." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${getAppBaseUrl()}/${locale}/account`,
  });

  if (!portal.url) {
    return NextResponse.json(
      { error: "Could not create billing portal session." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: portal.url });
}
