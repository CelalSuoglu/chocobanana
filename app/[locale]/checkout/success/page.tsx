import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { displayOrderNumber } from "@/lib/orders/number";
import { getStripe } from "@/lib/stripe/client";
import {
  getPaymentsMode,
  paymentsCheckoutEnabled,
} from "@/lib/stripe/config";

function formatMoney(
  amount: number | null,
  currency: string | null,
  locale: string,
): string | null {
  if (amount == null || !currency) return null;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const dict = await getDictionary(rawLocale);
  const { session_id: sessionId } = await searchParams;

  if (!paymentsCheckoutEnabled() || !sessionId) {
    return (
      <main className="section-pad mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center py-16 text-center">
        <h1 className="page-title">
          {dict.checkout.successTitle}
        </h1>
        <p className="mt-4 text-chocolate-soft">{dict.checkout.successMissing}</p>
        <Link
          href={`/${rawLocale}/shop`}
          className="mt-8 font-serif text-sm tracking-[0.12em] uppercase text-pink-deep"
        >
          {dict.checkout.backToShop}
        </Link>
      </main>
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["total_details"],
  });

  const paidOnStripe = session.payment_status === "paid";

  let dbOrder: {
    id: string;
    customerEmail: string;
    shippingAmountCadCents: number | null;
    taxAmountCadCents: number | null;
  } | null = null;
  if (isDatabaseConfigured()) {
    const prisma = requirePrisma();
    const select = {
      id: true,
      customerEmail: true,
      shippingAmountCadCents: true,
      taxAmountCadCents: true,
    } as const;
    for (let attempt = 0; attempt < (paidOnStripe ? 6 : 1); attempt += 1) {
      dbOrder = await prisma.order.findUnique({
        where: { stripeCheckoutSessionId: sessionId },
        select,
      });
      if (dbOrder || attempt === 5) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  const integrationAmount = formatMoney(
    session.amount_total,
    session.currency,
    rawLocale,
  );
  const shippingAmount = formatMoney(
    session.total_details?.amount_shipping ??
      dbOrder?.shippingAmountCadCents ??
      null,
    session.currency,
    rawLocale,
  );
  const taxAmount = formatMoney(
    session.total_details?.amount_tax ?? dbOrder?.taxAmountCadCents ?? null,
    session.currency,
    rawLocale,
  );
  const presentment = session.presentment_details;
  const presentmentAmount = formatMoney(
    presentment?.presentment_amount ?? null,
    presentment?.presentment_currency ?? null,
    rawLocale,
  );

  const pending =
    session.payment_status === "unpaid" &&
    session.status === "complete";
  const failedOrOpen =
    !paidOnStripe && session.payment_status !== "no_payment_required";

  const title = paidOnStripe
    ? dict.checkout.successTitle
    : pending
      ? dict.checkout.pendingTitle
      : dict.checkout.unpaidTitle;
  const body = paidOnStripe
    ? dict.checkout.successBody
    : pending
      ? dict.checkout.pendingBody
      : dict.checkout.unpaidBody;

  return (
    <main className="section-pad mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center py-16 text-center">
      <ClearCartOnSuccess active={paidOnStripe && Boolean(dbOrder)} />
      <p className="font-script text-2xl text-pink-deep">
        {paidOnStripe
          ? dict.checkout.successEyebrow
          : dict.checkout.pendingEyebrow}
      </p>
      <h1 className="page-title mt-2">
        {title}
      </h1>
      <p className="mt-4 text-chocolate-soft">{body}</p>
      {dbOrder ? (
        <p className="mt-6 font-serif text-2xl tracking-wide text-chocolate">
          <span className="block font-sans text-xs tracking-[0.14em] uppercase text-chocolate-soft">
            {dict.checkout.orderNumber}
          </span>
          {displayOrderNumber(dbOrder.id)}
        </p>
      ) : paidOnStripe ? (
        <p className="mt-6 text-sm text-chocolate-soft">
          {dict.checkout.orderNumberPending}
        </p>
      ) : null}

      <div className="store-card mt-8 px-6 py-6 text-start">
        <p className="text-sm text-chocolate-soft">
          <span className="font-serif text-chocolate">
            {dict.checkout.stripeStatus}:
          </span>{" "}
          {paidOnStripe
            ? dict.checkout.statusPaidOnStripe
            : session.payment_status}
        </p>
        {integrationAmount ? (
          <p className="mt-2 text-sm text-chocolate-soft">
            <span className="font-serif text-chocolate">
              {dict.checkout.integrationAmount}:
            </span>{" "}
            {integrationAmount}
          </p>
        ) : null}
        {shippingAmount ? (
          <p className="mt-2 text-sm text-chocolate-soft">
            <span className="font-serif text-chocolate">
              {dict.checkout.shippingAmount}:
            </span>{" "}
            {shippingAmount}
          </p>
        ) : null}
        {taxAmount ? (
          <p className="mt-2 text-sm text-chocolate-soft">
            <span className="font-serif text-chocolate">
              {dict.checkout.taxAmount}:
            </span>{" "}
            {taxAmount}
          </p>
        ) : null}
        {presentmentAmount &&
        presentment?.presentment_currency &&
        presentment.presentment_currency !== session.currency ? (
          <p className="mt-2 text-sm text-chocolate-soft">
            <span className="font-serif text-chocolate">
              {dict.checkout.presentmentAmount}:
            </span>{" "}
            {presentmentAmount}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-chocolate-soft">
          <span className="font-serif text-chocolate">
            {dict.checkout.orderRecord}:
          </span>{" "}
          {dbOrder
            ? dict.checkout.orderRecordReady
            : paidOnStripe
              ? dict.checkout.orderRecordPendingWebhook
              : dict.checkout.orderRecordNotPaid}
        </p>
        {dbOrder?.customerEmail ? (
          <p className="mt-2 text-sm text-chocolate-soft">
            <span className="font-serif text-chocolate">
              {dict.checkout.contactEmail}:
            </span>{" "}
            {dbOrder.customerEmail}
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-relaxed text-chocolate-soft/90">
          {dict.checkout.webhookTrustNote}
        </p>
        {failedOrOpen && !paidOnStripe ? (
          <p className="mt-2 text-xs text-pink-deep">
            {dict.checkout.unpaidHint}
          </p>
        ) : null}
        {getPaymentsMode() === "test" ? (
          <p className="mt-2 text-xs text-pink-deep">{dict.checkout.testModeNote}</p>
        ) : null}
      </div>

      <Link
        href={`/${rawLocale}/shop`}
        className="btn-secondary btn-inline mx-auto mt-8"
      >
        {dict.checkout.backToShop}
      </Link>
    </main>
  );
}
