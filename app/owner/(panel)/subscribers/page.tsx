import { OwnerAutoRefresh } from "@/components/owner-auto-refresh";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { listEmailSubscribers } from "@/lib/mailing/service";

function toronto(value: Date) {
  return value.toLocaleString("en-CA", { timeZone: "America/Toronto" });
}

export default async function OwnerSubscribersPage() {
  const rows = isDatabaseConfigured()
    ? await listEmailSubscribers(requirePrisma())
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Email subscribers</h1>
          <p className="mt-1 text-sm text-chocolate-soft">
            Mailing-list signups. These are not customer accounts.
          </p>
        </div>
        <OwnerAutoRefresh />
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-chocolate-soft">No subscribers yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-t border-line">
          {rows.map((row) => (
            <li key={row.id} className="grid gap-1 py-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-baseline sm:gap-4">
              <div>
                <p className="text-sm text-chocolate">{row.email}</p>
                <p className="text-sm text-chocolate-soft">{row.firstName || "—"}</p>
              </div>
              <p className="text-xs text-chocolate-soft">{toronto(row.createdAt)}</p>
              <p className="text-sm text-chocolate">
                {row.verifiedAt ? "Verified" : "Not verified"}
              </p>
              <p className="text-sm text-chocolate">
                {row.status === "CONFIRMED"
                  ? "Subscribed"
                  : row.status === "UNSUBSCRIBED"
                    ? "Unsubscribed"
                    : "Pending"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
