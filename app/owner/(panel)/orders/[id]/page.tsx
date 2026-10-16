import Link from "next/link";
import { notFound } from "next/navigation";
import { FulfillmentStatusForm } from "@/components/fulfillment-status-form";
import { isDatabaseConfigured } from "@/lib/db";
import { displayOrderNumber } from "@/lib/orders/number";
import { getOwnerOrder } from "@/lib/orders/repository";

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function OwnerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isDatabaseConfigured()) notFound();

  const order = await getOwnerOrder(id);
  if (!order) notFound();

  const postageIncluded = order.items.some((item) =>
    item.catalogProductId.startsWith("snail-mail-"),
  );

  return (
    <div>
      <Link
        href="/owner/orders"
        className="text-sm text-chocolate-soft hover:text-chocolate"
      >
        ← Orders
      </Link>
      <h1 className="page-title mt-4">
        Order {displayOrderNumber(order.publicNumber)}
      </h1>
      <p className="mt-1 text-xs text-chocolate-soft">{order.id}</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wider text-chocolate-soft">
            Customer
          </dt>
          <dd className="mt-1">
            {order.customerName ?? "—"}
            <br />
            {order.customerEmail}
            {order.user ? null : (
              <span className="ms-2 text-xs uppercase tracking-wider text-chocolate-soft">
                Guest
              </span>
            )}
            {order.customerPhone ? (
              <>
                <br />
                {order.customerPhone}
              </>
            ) : null}
            {order.user ? (
              <span className="block text-xs text-chocolate-soft">
                Linked account: {order.user.id}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-chocolate-soft">
            Payment
          </dt>
          <dd className="mt-1">
            {order.paymentStatus} ·{" "}
            {formatMoney(order.amountTotalCadCents, order.currency)}
            {postageIncluded && (order.shippingAmountCadCents ?? 0) === 0 ? (
              <span className="block text-xs text-chocolate-soft">
                Postage included
              </span>
            ) : order.shippingAmountCadCents != null ? (
              <span className="block text-xs text-chocolate-soft">
                Shipping:{" "}
                {formatMoney(order.shippingAmountCadCents, order.currency)}
              </span>
            ) : null}
            {order.discountAmountCadCents != null && order.discountAmountCadCents > 0 ? (
              <span className="block text-xs text-chocolate-soft">
                Reward discount:{" "}
                {formatMoney(order.discountAmountCadCents, order.currency)}
              </span>
            ) : null}
            {order.taxAmountCadCents != null ? (
              <span className="block text-xs text-chocolate-soft">
                Tax: {formatMoney(order.taxAmountCadCents, order.currency)}
              </span>
            ) : null}
            <span className="block text-xs text-chocolate-soft">
              Session: {order.stripeCheckoutSessionId}
            </span>
            {order.stripePaymentIntentId ? (
              <span className="block text-xs text-chocolate-soft">
                Intent: {order.stripePaymentIntentId}
              </span>
            ) : null}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wider text-chocolate-soft">
            Shipping
          </dt>
          <dd className="mt-1 text-sm leading-relaxed">
            {order.shippingName ?? "—"}
            <br />
            {[order.shippingLine1, order.shippingLine2]
              .filter(Boolean)
              .join(", ") || "—"}
            <br />
            {[order.shippingCity, order.shippingState, order.shippingPostalCode]
              .filter(Boolean)
              .join(", ")}
            <br />
            {order.shippingCountry ?? ""}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <h2 className="font-serif text-xl text-chocolate">Items</h2>
        <ul className="mt-3 divide-y divide-pink/25 border-t border-line">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-4 py-3 text-sm"
            >
              <span>
                {item.name} ×{item.quantity}
              </span>
              <span>
                {formatMoney(
                  item.unitAmountCadCents * item.quantity,
                  item.currency,
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <FulfillmentStatusForm
          orderId={order.id}
          current={order.fulfillmentStatus}
        />
      </div>
    </div>
  );
}
