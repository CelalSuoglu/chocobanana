import Link from "next/link";
import { displayName } from "@/lib/auth/profile";
import { isDatabaseConfigured } from "@/lib/db";
import { listMailClubSubscriptions } from "@/lib/subscriptions/repository";
import type { MailClubSubscriptionStatus } from "@prisma/client";

const STATUSES: Array<MailClubSubscriptionStatus | "ALL"> = [
  "ALL",
  "ACTIVE",
  "PAUSED",
  "CANCELED",
  "INCOMPLETE",
  "PAST_DUE",
];

export default async function OwnerSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusParam = params.status?.toUpperCase();
  const status = (
    STATUSES.includes(statusParam as MailClubSubscriptionStatus | "ALL")
      ? statusParam
      : "ALL"
  ) as MailClubSubscriptionStatus | "ALL";

  const configured = isDatabaseConfigured();
  const rows = configured
    ? await listMailClubSubscriptions({ status })
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Mail Club</h1>
          <p className="mt-1 text-sm text-chocolate-soft">
            Paid members only. Free customer accounts never appear here.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "/owner/subscriptions" : `/owner/subscriptions?status=${s}`}
            className={`rounded-full border px-3 py-1.5 text-xs tracking-wider uppercase ${
              status === s
                ? "border-pink-deep bg-pink-soft/50 text-pink-deep"
                : "border-line text-chocolate-soft hover:border-pink-deep"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {!configured ? (
        <p className="mt-8 text-sm text-chocolate-soft">Database not configured.</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-sm text-chocolate-soft">No subscriptions yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-pink/25 border-t border-line">
          {rows.map((row) => (
            <li key={row.id} className="py-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-lg text-chocolate">
                    {displayName(
                      row.user.firstName,
                      row.user.lastName,
                      row.user.name,
                    )}
                  </p>
                  <p className="text-xs text-chocolate-soft">{row.user.email}</p>
                  <p className="mt-1 text-xs text-chocolate-soft/80">
                    Sub {row.stripeSubscriptionId.slice(-10)} · Customer{" "}
                    {row.stripeCustomerId.slice(-8)}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xs uppercase tracking-wider text-pink-deep">
                    {row.status}
                  </p>
                  <p className="mt-1 text-xs text-chocolate-soft">
                    Period end:{" "}
                    {row.currentPeriodEnd
                      ? new Date(row.currentPeriodEnd).toLocaleDateString("en-CA")
                      : "—"}
                  </p>
                  {row.cancelAtPeriodEnd ? (
                    <p className="text-xs text-chocolate-soft">Cancels at period end</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
