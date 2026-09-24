import { OwnerAutoRefresh } from "@/components/owner-auto-refresh";
import { isDatabaseConfigured } from "@/lib/db";
import { listOwnerCustomers } from "@/lib/orders/repository";

export default async function OwnerMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const members = isDatabaseConfigured()
    ? await listOwnerCustomers({ q })
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#f3e6d8]">Memberships</h1>
          <p className="mt-1 text-sm text-[#c9a27a]">
            Customer accounts created on the storefront. Owner accounts never
            appear here.
          </p>
        </div>
        <OwnerAutoRefresh />
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
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
          No customer accounts yet. When shoppers register on Preview, they
          appear here automatically.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 border-t border-white/10">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-start justify-between gap-3 py-4"
            >
              <div>
                <p className="font-serif text-lg">
                  {member.name ?? "—"} · {member.email}
                </p>
                <p className="text-xs text-[#c9a27a]">
                  {[member.phone, member.city, member.country]
                    .filter(Boolean)
                    .join(" · ") || "No address on file"}
                </p>
                <p className="text-xs text-[#c9a27a]">
                  {[member.addressLine1, member.region, member.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="text-xs text-[#c9a27a]">
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
          ))}
        </ul>
      )}
    </div>
  );
}
