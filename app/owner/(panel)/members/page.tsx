import { OwnerAutoRefresh } from "@/components/owner-auto-refresh";
import { displayName } from "@/lib/auth/profile";
import { isDatabaseConfigured } from "@/lib/db";
import {
  getOwnerDashboardStats,
  listOwnerCustomers,
} from "@/lib/orders/repository";

export default async function OwnerMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const members = isDatabaseConfigured()
    ? await listOwnerCustomers({ q })
    : [];
  const stats = isDatabaseConfigured()
    ? await getOwnerDashboardStats()
    : { memberTotal: 0, membersNew: 0 };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-chocolate">Members</h1>
          <p className="mt-1 text-sm text-chocolate-soft">
            Customer accounts from the storefront. Owner accounts never appear
            here.
          </p>
          <p className="mt-2 text-xs text-chocolate-soft/80">
            {stats.memberTotal} total · {stats.membersNew} new in last 24h
          </p>
        </div>
        <OwnerAutoRefresh />
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, email, or phone…"
          className="owner-input min-w-[220px] flex-1"
        />
        <button type="submit" className="owner-btn">
          Search
        </button>
      </form>

      {members.length === 0 ? (
        <p className="mt-10 text-sm text-chocolate-soft">
          No customer accounts yet. When shoppers register, they appear here
          automatically.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-pink/25 border-t border-pink/30">
          {members.map((member) => {
            const fullName = displayName(
              member.firstName,
              member.lastName,
              member.name,
            );
            const address = [
              member.addressLine1,
              member.addressLine2,
              member.city,
              member.region,
              member.postalCode,
              member.country,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <li
                key={member.id}
                className="flex flex-wrap items-start justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-serif text-lg">{fullName}</p>
                  <p className="text-sm text-chocolate-soft">
                    {member.email}
                    {member.phone ? ` · ${member.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-chocolate-soft/90">
                    {address || "No address on file"}
                  </p>
                  <p className="mt-1 text-xs text-chocolate-soft/70">
                    Joined {new Date(member.createdAt).toLocaleString("en-CA")} ·
                    locale {member.preferredLocale ?? "en"} ·{" "}
                    {member.emailVerified ? "email verified" : "email pending"}
                  </p>
                </div>
                <p className="text-sm text-chocolate-soft">
                  {member._count.orders} paid order
                  {member._count.orders === 1 ? "" : "s"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
