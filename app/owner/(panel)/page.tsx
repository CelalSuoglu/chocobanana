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
          <h1 className="font-serif text-3xl text-[#f3e6d8]">Orders</h1>
          <p className="mt-1 text-sm text-[#c9a27a]">
            Paid orders only — created after Stripe webhook confirmation.
          </p>
        </div>
        <OwnerAutoRefresh />
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email, name, order id…"
          className="min-h-10 min-w-[220px] flex-1 rounded-md border border-white/15 bg-[#120e0b] px-3 text-sm text-[#f3e6d8]"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-10 rounded-md border border-white/15 bg-[#120e0b] px-3 text-sm text-[#f3e6d8]"
        >
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {value === "ALL" ? "All statuses" : value}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="min-h-10 rounded-md border border-[#c9a27a]/50 px-4 text-sm hover:bg-white/5"
        >
          Filter
        </button>
      </form>

      {orders.length === 0 ? (
        <p className="mt-10 text-sm text-[#c9a27a]">
          No paid orders yet. Complete a test Checkout with webhook forwarding to
          see real orders here.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 border-t border-white/10">
          {orders.map((order) => (
            <li key={order.id} className="py-4">
              <Link
                href={`/owner/orders/${order.id}`}
                className="flex flex-wrap items-start justify-between gap-3 hover:text-[#fff0e0]"
              >
                <div>
                  <p className="font-serif text-lg">{order.customerEmail}</p>
                  <p className="text-xs text-[#c9a27a]">
                    {new Date(order.createdAt).toLocaleString("en-CA")} ·{" "}
                    {order.fulfillmentStatus} · payment {order.paymentStatus}
                  </p>
                  <p className="mt-1 text-sm text-[#c9a27a]">
                    {order.items
                      .map((item) => `${item.name} ×${item.quantity}`)
                      .join(", ")}
                  </p>
                </div>
                <p className="font-serif text-lg">
                  {formatMoney(order.amountTotalCadCents, order.currency)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12 border-t border-white/10 pt-8">
        <h2 className="font-serif text-xl">Extensible later</h2>
        <p className="mt-2 max-w-xl text-sm text-[#c9a27a]">
          Catalog product create/edit and CAD price management will live under
          Catalog — same owner gate and Postgres models, without changing the
          customer storefront shell.
        </p>
      </section>
    </div>
  );
}
