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
          <h1 className="font-serif text-3xl text-[#f3e6d8]">Members</h1>
          <p className="mt-1 text-sm text-[#c9a27a]">
            Customer accounts from the storefront. Owner accounts never appear
            here.
          </p>
          <p className="mt-2 text-xs text-[#c9a27a]/80">
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
          className="min-h-10 min-w-[220px] flex-1 rounded-md border border-white/15 bg-[#120e0b] px-3 text-sm text-[#f3e6d8]"
        />
        <button
          type="submit"
          className="min-h-10 rounded-md border border-[#c9a27a]/50 px-4 text-sm hover:bg-white/5"
        >
          Search
        </button>
      </form>

      {members.length === 0 ? (
        <p className="mt-10 text-sm text-[#c9a27a]">
          No customer accounts yet. When shoppers register, they appear here
          automatically.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 border-t border-white/10">
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
                  <p className="text-sm text-[#c9a27a]">
                    {member.email}
                    {member.phone ? ` · ${member.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#c9a27a]/90">
                    {address || "No address on file"}
                  </p>
                  <p className="mt-1 text-xs text-[#c9a27a]/70">
                    Joined {new Date(member.createdAt).toLocaleString("en-CA")} ·
                    locale {member.preferredLocale ?? "en"} ·{" "}
                    {member.emailVerified ? "email verified" : "email pending"}
                  </p>
                </div>
                <p className="text-sm text-[#c9a27a]">
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
