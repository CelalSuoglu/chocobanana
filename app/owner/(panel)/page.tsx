import Link from "next/link";
import { OwnerAutoRefresh } from "@/components/owner-auto-refresh";
import { displayName } from "@/lib/auth/profile";
import { isDatabaseConfigured } from "@/lib/db";
import {
  getOwnerDashboardStats,
  listOwnerCustomers,
  listOwnerOrders,
} from "@/lib/orders/repository";

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function OwnerDashboardPage() {
  const configured = isDatabaseConfigured();
  const stats = configured
    ? await getOwnerDashboardStats()
    : {
        memberTotal: 0,
        membersNew: 0,
        orderTotal: 0,
        ordersNew: 0,
        ordersPreparing: 0,
      };

  const [recentMembers, recentOrders] = configured
    ? await Promise.all([
        listOwnerCustomers({}),
        listOwnerOrders({ status: "ALL" }),
      ])
    : [[], []];

  const newMembers = recentMembers.slice(0, 8);
  const newOrders = recentOrders.slice(0, 8);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#f3e6d8]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#c9a27a]">
            New members and paid orders are counted separately.
          </p>
        </div>
        <OwnerAutoRefresh />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Members" value={stats.memberTotal} href="/owner/members" />
        <StatCard
          label="New members (24h)"
          value={stats.membersNew}
          href="/owner/members"
        />
        <StatCard label="Paid orders" value={stats.orderTotal} href="/owner/orders" />
        <StatCard
          label="New orders (24h)"
          value={stats.ordersNew}
          href="/owner/orders"
        />
        <StatCard
          label="Needs fulfillment"
          value={stats.ordersPreparing}
          href="/owner/orders?status=NEW"
        />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl text-[#f3e6d8]">New members</h2>
            <Link
              href="/owner/members"
              className="text-xs text-[#c9a27a] hover:text-[#f3e6d8]"
            >
              View all
            </Link>
          </div>
          {newMembers.length === 0 ? (
            <p className="mt-4 text-sm text-[#c9a27a]">No customer accounts yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
              {newMembers.map((member) => (
                <li key={member.id} className="py-3 text-sm">
                  <p className="font-serif text-base text-[#f3e6d8]">
                    {displayName(member.firstName, member.lastName, member.name)}
                  </p>
                  <p className="text-xs text-[#c9a27a]">
                    {member.email}
                    {member.phone ? ` · ${member.phone}` : ""}
                  </p>
                  <p className="text-xs text-[#c9a27a]/80">
                    {new Date(member.createdAt).toLocaleString("en-CA")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl text-[#f3e6d8]">New orders</h2>
            <Link
              href="/owner/orders"
              className="text-xs text-[#c9a27a] hover:text-[#f3e6d8]"
            >
              View all
            </Link>
          </div>
          {newOrders.length === 0 ? (
            <p className="mt-4 text-sm text-[#c9a27a]">
              No paid orders yet. They appear only after a verified Stripe webhook.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
              {newOrders.map((order) => (
                <li key={order.id} className="py-3">
                  <Link
                    href={`/owner/orders/${order.id}`}
                    className="block hover:text-[#fff0e0]"
                  >
                    <p className="font-serif text-base">
                      #{order.id.slice(-8)} ·{" "}
                      {formatMoney(order.amountTotalCadCents, order.currency)}
                    </p>
                    <p className="text-xs text-[#c9a27a]">
                      {order.customerEmail} · {order.fulfillmentStatus}
                    </p>
                    <p className="text-xs text-[#c9a27a]/80">
                      {new Date(order.createdAt).toLocaleString("en-CA")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-white/10 bg-[#120e0b] px-4 py-4 transition-colors hover:border-[#c9a27a]/40"
    >
      <p className="text-xs uppercase tracking-wider text-[#c9a27a]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#f3e6d8]">{value}</p>
    </Link>
  );
}
