import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderStore } from "@/lib/orders/store";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
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
        <h1 className="font-serif text-3xl text-chocolate">
          {dict.checkout.successTitle}
        </h1>
        <p className="mt-4 text-chocolate-soft">{dict.checkout.successMissing}</p>
        <Link
          href={`/${rawLocale}#shop`}
          className="mt-8 font-serif text-sm tracking-[0.12em] uppercase text-pink-deep"
        >
          {dict.checkout.backToShop}
        </Link>
      </main>
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const store = getOrderStore();
  const order = await store.getByCheckoutSessionId(sessionId);

  const integrationAmount = formatMoney(
    session.amount_total,
    session.currency,
    rawLocale,
  );
  const presentment = session.presentment_details;
  const presentmentAmount = formatMoney(
    presentment?.presentment_amount ?? null,
    presentment?.presentment_currency ?? null,
    rawLocale,
  );

  const paidOnStripe =
    session.payment_status === "paid" ||
    session.status === "complete";

  return (
    <main className="section-pad mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center py-16 text-center">
      <p className="font-script text-2xl text-pink-deep">
        {dict.checkout.successEyebrow}
      </p>
      <h1 className="mt-2 font-serif text-3xl text-chocolate md:text-4xl">
        {dict.checkout.successTitle}
      </h1>
      <p className="mt-4 text-chocolate-soft">{dict.checkout.successBody}</p>

      <div className="mt-8 rounded-3xl bg-paper/90 px-6 py-6 text-start ring-1 ring-pink/35">
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
          {order
            ? dict.checkout.orderRecordReady
            : dict.checkout.orderRecordPendingWebhook}
        </p>
        {order?.customerEmail ? (
          <p className="mt-2 text-sm text-chocolate-soft">
            <span className="font-serif text-chocolate">
              {dict.checkout.contactEmail}:
            </span>{" "}
            {order.customerEmail}
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-relaxed text-chocolate-soft/90">
          {dict.checkout.webhookTrustNote}
        </p>
        {getPaymentsMode() === "test" ? (
          <p className="mt-2 text-xs text-pink-deep">{dict.checkout.testModeNote}</p>
        ) : null}
      </div>

      <Link
        href={`/${rawLocale}#shop`}
        className="mt-8 font-serif text-sm tracking-[0.12em] uppercase text-pink-deep"
      >
        {dict.checkout.backToShop}
      </Link>
    </main>
  );
}
