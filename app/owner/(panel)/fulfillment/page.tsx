import Link from "next/link";
import { FulfillmentStatusForm } from "@/components/fulfillment-status-form";
import { displayName } from "@/lib/auth/profile";
import { isDatabaseConfigured } from "@/lib/db";
import { displayOrderNumber } from "@/lib/orders/number";
import { listFulfillmentRows } from "@/lib/orders/repository";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default async function OwnerFulfillmentPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;

  const configured = isDatabaseConfigured();
  const data = configured
    ? await listFulfillmentRows({ year, month })
    : { orders: [], activeSubs: [] };

  const csvLines = [
    [
      "source",
      "id",
      "name",
      "email",
      "phone",
      "line1",
      "line2",
      "city",
      "region",
      "postal",
      "country",
      "status",
    ].join(","),
  ];

  for (const order of data.orders) {
    csvLines.push(
      [
        "order",
        order.id,
        order.shippingName || order.customerName || "",
        order.customerEmail,
        order.customerPhone || "",
        order.shippingLine1 || "",
        order.shippingLine2 || "",
        order.shippingCity || "",
        order.shippingState || "",
        order.shippingPostalCode || "",
        order.shippingCountry || "",
        order.fulfillmentStatus,
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }

  for (const sub of data.activeSubs) {
    const u = sub.user;
    csvLines.push(
      [
        "active_subscriber",
        sub.id,
        displayName(u.firstName, u.lastName, u.name),
        u.email,
        u.phone || "",
        u.addressLine1 || "",
        u.addressLine2 || "",
        u.city || "",
        u.region || "",
        u.postalCode || "",
        u.country || "",
        sub.status,
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }

  const csv = csvLines.join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  const monthLabel = new Date(year, month - 1, 1).toLocaleString("en-CA", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Fulfillment</h1>
          <p className="mt-1 text-sm text-chocolate-soft">
            Paid eligible sendings for {monthLabel}. No sample data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/owner/fulfillment?year=${prevYear}&month=${prevMonth}`}
            className="owner-btn text-xs"
          >
            Previous
          </Link>
          <Link
            href={`/owner/fulfillment?year=${nextYear}&month=${nextMonth}`}
            className="owner-btn text-xs"
          >
            Next
          </Link>
          {(data.orders.length > 0 || data.activeSubs.length > 0) && (
            <a
              href={csvHref}
              download={`fulfillment-${year}-${String(month).padStart(2, "0")}.csv`}
              className="owner-btn owner-btn-primary text-xs"
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      {!configured ? (
        <p className="mt-8 text-sm text-chocolate-soft">Database not configured.</p>
      ) : data.orders.length === 0 && data.activeSubs.length === 0 ? (
        <p className="mt-8 text-sm text-chocolate-soft">
          No paid orders need fulfillment right now.
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="font-serif text-xl text-chocolate">
              Paid orders ({data.orders.length})
            </h2>
            {data.orders.length === 0 ? (
              <p className="mt-3 text-sm text-chocolate-soft">None this month.</p>
            ) : (
              <ul className="mt-4 divide-y divide-pink/25 border-t border-pink/30">
                {data.orders.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/owner/orders/${order.id}`}
                        className="font-serif text-lg text-chocolate hover:text-pink-deep"
                      >
                        {displayOrderNumber(order.id)} · {order.customerEmail}
                      </Link>
                      <p className="mt-1 text-xs text-chocolate-soft">
                        {[
                          order.shippingName,
                          order.shippingLine1,
                          order.shippingCity,
                          order.shippingCountry,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <ul className="mt-2 text-xs text-chocolate-soft">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.name} ×{item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <FulfillmentStatusForm
                      orderId={order.id}
                      current={order.fulfillmentStatus}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-serif text-xl text-chocolate">
              Active subscribers ({data.activeSubs.length})
            </h2>
            <p className="mt-1 text-xs text-chocolate-soft">
              Included in CSV for address planning. Mark shipped on related orders above.
            </p>
            {data.activeSubs.length === 0 ? (
              <p className="mt-3 text-sm text-chocolate-soft">No active paid subscribers.</p>
            ) : (
              <ul className="mt-4 divide-y divide-pink/25 border-t border-pink/30">
                {data.activeSubs.map((sub) => (
                  <li key={sub.id} className="py-3 text-sm">
                    <p className="font-serif text-base text-chocolate">
                      {displayName(
                        sub.user.firstName,
                        sub.user.lastName,
                        sub.user.name,
                      )}
                    </p>
                    <p className="text-xs text-chocolate-soft">
                      {sub.user.email}
                      {sub.user.phone ? ` · ${sub.user.phone}` : ""}
                    </p>
                    <p className="text-xs text-chocolate-soft/80">
                      {[
                        sub.user.addressLine1,
                        sub.user.city,
                        sub.user.postalCode,
                        sub.user.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "No address on profile"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
