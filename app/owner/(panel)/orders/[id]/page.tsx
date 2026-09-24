import Link from "next/link";
import { notFound } from "next/navigation";
import { FulfillmentStatusForm } from "@/components/fulfillment-status-form";
import { isDatabaseConfigured } from "@/lib/db";
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

  return (
    <div>
      <Link href="/owner" className="text-sm text-[#c9a27a] hover:text-[#f3e6d8]">
        ← Orders
      </Link>
      <h1 className="mt-4 font-serif text-3xl">Order detail</h1>
      <p className="mt-1 text-xs text-[#c9a27a]">{order.id}</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wider text-[#c9a27a]">
            Customer
          </dt>
          <dd className="mt-1">
            {order.customerName ?? "—"}
            <br />
            {order.customerEmail}
            {order.customerPhone ? (
              <>
                <br />
                {order.customerPhone}
              </>
            ) : null}
            {order.user ? (
              <span className="block text-xs text-[#c9a27a]">
                Linked account: {order.user.id}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[#c9a27a]">
            Payment
          </dt>
          <dd className="mt-1">
            {order.paymentStatus} ·{" "}
            {formatMoney(order.amountTotalCadCents, order.currency)}
            <span className="block text-xs text-[#c9a27a]">
              Session: {order.stripeCheckoutSessionId}
            </span>
            {order.stripePaymentIntentId ? (
              <span className="block text-xs text-[#c9a27a]">
                Intent: {order.stripePaymentIntentId}
              </span>
            ) : null}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wider text-[#c9a27a]">
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
        <h2 className="font-serif text-xl">Items</h2>
        <ul className="mt-3 divide-y divide-white/10 border-t border-white/10">
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
