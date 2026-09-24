import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountProfileForm } from "@/components/account-profile-form";
import { logoutCustomerAction } from "@/lib/auth/actions";
import { getOptionalSession } from "@/lib/auth/session";
import { PageHero } from "@/components/page-hero";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
import { listOrdersForUser } from "@/lib/orders/repository";

function formatMoney(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const session = await getOptionalSession();

  if (!session?.user?.id) {
    redirect(hrefFor(raw, "/login"));
  }

  if (session.user.role === "OWNER") {
    redirect("/owner");
  }

  const profile = isDatabaseConfigured()
    ? await requirePrisma().user.findUnique({
        where: { id: session.user.id },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          region: true,
          postalCode: true,
          country: true,
        },
      })
    : null;

  const orders = isDatabaseConfigured()
    ? await listOrdersForUser(session.user.id)
    : [];

  return (
    <main className="section-pad flex-1 pb-16 pt-8 md:pb-20 md:pt-12">
      <PageHero
        eyebrow={dict.account.eyebrow}
        title={dict.account.title}
        intro={dict.account.intro}
      />

      <section className="mx-auto mt-10 max-w-2xl rounded-3xl bg-paper/90 px-6 py-6 ring-1 ring-pink/35">
        <h2 className="font-serif text-2xl text-chocolate">
          {dict.account.profile}
        </h2>
        <p className="mt-1 text-sm text-chocolate-soft">
          {dict.account.email}: {profile?.email ?? session.user.email}
        </p>
        {profile ? (
          <AccountProfileForm dict={dict} locale={raw} profile={profile} />
        ) : (
          <p className="mt-4 text-sm text-chocolate-soft">
            {dict.account.ordersUnavailable}
          </p>
        )}
        <form action={logoutCustomerAction} className="mt-6">
          <input type="hidden" name="locale" value={raw} />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-chocolate/50 px-5 py-2.5 font-serif text-sm tracking-[0.14em] uppercase text-chocolate-soft transition-colors hover:border-pink-deep hover:text-pink-deep"
          >
            {dict.account.signOut}
          </button>
        </form>
      </section>

      <section className="mx-auto mt-10 max-w-2xl">
        <h2 className="font-serif text-2xl text-chocolate">
          {dict.account.orders}
        </h2>
        {!isDatabaseConfigured() ? (
          <p className="mt-4 text-sm text-chocolate-soft">
            {dict.account.ordersUnavailable}
          </p>
        ) : orders.length === 0 ? (
          <p className="mt-4 text-sm text-chocolate-soft">
            {dict.account.noOrders}{" "}
            <Link href={hrefFor(raw, "/shop")} className="text-pink-deep">
              {dict.account.browseShop}
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-3xl bg-paper/90 px-5 py-4 ring-1 ring-pink/35"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-lg text-chocolate">
                      {formatMoney(
                        order.amountTotalCadCents,
                        order.currency,
                        raw,
                      )}
                    </p>
                    <p className="text-xs text-chocolate-soft">
                      #{order.id.slice(-8)} ·{" "}
                      {new Date(order.createdAt).toLocaleString(raw)} ·{" "}
                      {order.fulfillmentStatus}
                    </p>
                    {(order.shippingLine1 || order.shippingCity) && (
                      <p className="mt-2 text-xs leading-relaxed text-chocolate-soft">
                        {[
                          order.shippingLine1,
                          order.shippingLine2,
                          order.shippingCity,
                          order.shippingState,
                          order.shippingPostalCode,
                          order.shippingCountry,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-wider text-pink-deep">
                    {order.paymentStatus}
                  </p>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-chocolate-soft">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} ×{item.quantity}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
