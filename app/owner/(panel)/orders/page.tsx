import Link from "next/link";
import type { FulfillmentStatus } from "@prisma/client";
import { OwnerAutoRefresh } from "@/components/owner-auto-refresh";
import { isDatabaseConfigured } from "@/lib/db";
import { listOwnerOrders } from "@/lib/orders/repository";

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

const statusOptions: Array<FulfillmentStatus | "ALL"> = [
  "ALL",
  "NEW",
  "PREPARING",
  "SHIPPED",
  "COMPLETED",
  "CANCELED",
];

export default async function OwnerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status: rawStatus = "ALL" } = await searchParams;
  const status = (
    statusOptions.includes(rawStatus as FulfillmentStatus | "ALL")
      ? rawStatus
      : "ALL"
  ) as FulfillmentStatus | "ALL";

  const orders = isDatabaseConfigured()
    ? await listOwnerOrders({ q, status })
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-chocolate">Orders</h1>
          <p className="mt-1 text-sm text-chocolate-soft">
            Paid orders only — created after Stripe webhook confirmation. Payment
            status cannot be set to paid manually.
          </p>
        </div>
        <OwnerAutoRefresh />
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email, name, order id…"
          className="owner-input min-w-[220px] flex-1"
        />
        <select
          name="status"
          defaultValue={status}
          className="owner-input w-auto"
        >
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {value === "ALL" ? "All statuses" : value}
            </option>
          ))}
        </select>
        <button type="submit" className="owner-btn">
          Filter
        </button>
      </form>

      {orders.length === 0 ? (
        <p className="mt-10 text-sm text-chocolate-soft">
          No paid orders yet. Complete a test Checkout with webhook forwarding to
          see real orders here. Sample/demo orders are never listed.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-pink/25 border-t border-pink/30">
          {orders.map((order) => (
            <li key={order.id} className="py-4">
              <Link
                href={`/owner/orders/${order.id}`}
                className="flex flex-wrap items-start justify-between gap-3 hover:text-pink-deep"
              >
                <div>
                  <p className="font-serif text-lg">
                    #{order.id.slice(-8)} · {order.customerEmail}
                  </p>
                  <p className="text-xs text-chocolate-soft">
                    {new Date(order.createdAt).toLocaleString("en-CA")} ·{" "}
                    {order.fulfillmentStatus} · payment {order.paymentStatus}
                    {order.customerPhone ? ` · ${order.customerPhone}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-chocolate-soft">
                    {order.items
                      .map((item) => `${item.name} ×${item.quantity}`)
                      .join(", ")}
                  </p>
                  {(order.shippingLine1 || order.shippingCity) && (
                    <p className="mt-1 text-xs text-chocolate-soft/80">
                      {[
                        order.shippingName,
                        order.shippingLine1,
                        order.shippingCity,
                        order.shippingCountry,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <p className="font-serif text-lg">
                  {formatMoney(order.amountTotalCadCents, order.currency)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
