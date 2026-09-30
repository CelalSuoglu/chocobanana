import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountAddressForm } from "@/components/account-address-form";
import { AccountProfileForm } from "@/components/account-profile-form";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { logoutCustomerAction } from "@/lib/auth/actions";
import { getOptionalSession } from "@/lib/auth/session";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
import { displayOrderNumber } from "@/lib/orders/number";
import { listOrdersForUser } from "@/lib/orders/repository";
import { getCustomerRewardView } from "@/lib/rewards/repository";
import { progressTowardNextReward } from "@/lib/rewards/logic";
import { getMailClubSubscriptionForUser } from "@/lib/subscriptions/repository";

function formatMoney(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatAddress(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
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

  const rewards = isDatabaseConfigured()
    ? await getCustomerRewardView(session.user.id)
    : { qualifyingCount: 0, codes: [] };
  const rewardProgress = progressTowardNextReward(rewards.qualifyingCount);

  const subscription = isDatabaseConfigured()
    ? await getMailClubSubscriptionForUser(session.user.id)
    : null;

  return (
    <main className="section-pad flex-1 pb-16 pt-8 md:pb-20 md:pt-12">
      <header className="mx-auto max-w-2xl">
        <h1 className="page-title">{dict.account.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">{dict.account.intro}</p>
      </header>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-10">
        <section className="store-card px-6 py-6">
          <h2 className="font-serif text-2xl text-chocolate">
            {dict.account.profileSection}
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
              className="btn-secondary btn-inline"
            >
              {dict.account.signOut}
            </button>
          </form>
        </section>

        <section className="store-card px-6 py-6">
          <h2 className="font-serif text-2xl text-chocolate">
            {dict.account.addressSection}
          </h2>
          <p className="mt-1 text-sm text-chocolate-soft">
            {dict.account.addressHint}
          </p>
          {profile ? (
            <>
              <p className="mt-3 text-sm text-chocolate-soft">
                {formatAddress([
                  profile.addressLine1,
                  profile.addressLine2,
                  profile.city,
                  profile.region,
                  profile.postalCode,
                  profile.country,
                ]) || "—"}
              </p>
              <AccountAddressForm
                dict={dict}
                locale={raw}
                profile={{
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  phone: profile.phone,
                  addressLine1: profile.addressLine1,
                  addressLine2: profile.addressLine2,
                  city: profile.city,
                  region: profile.region,
                  postalCode: profile.postalCode,
                  country: profile.country,
                }}
              />
            </>
          ) : (
            <p className="mt-4 text-sm text-chocolate-soft">
              {dict.account.ordersUnavailable}
            </p>
          )}
        </section>

        <section className="store-card px-6 py-6">
          <h2 className="font-serif text-2xl text-chocolate">
            {dict.account.rewardSection}
          </h2>
          <p className="mt-3 text-sm text-chocolate">
            {dict.account.rewardProgress
              .replace("{current}", String(rewardProgress.current))
              .replace("{target}", String(rewardProgress.target))}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">
            {dict.account.rewardHint}
          </p>
          {rewards.codes.length === 0 ? (
            <p className="mt-4 text-sm text-chocolate-soft">{dict.account.rewardNone}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {rewards.codes.map((code) => (
                <li
                  key={code.code}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-pink/40 px-4 py-3"
                >
                  <span className="font-serif tracking-wide text-chocolate">{code.code}</span>
                  <span className="text-end text-xs uppercase tracking-wider text-chocolate-soft">
                    {code.firstOrderOnly ? `${dict.account.rewardFirstOrder} · ` : ""}
                    {code.status === "RESERVED"
                      ? dict.account.rewardReserved
                      : dict.account.rewardAvailable}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-serif text-2xl text-chocolate">
            {dict.account.ordersSection}
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
                  className="store-card px-5 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-lg text-chocolate">
                        {dict.account.orderNumber} {displayOrderNumber(order.id)}
                      </p>
                      <p className="text-xs text-chocolate-soft">
                        {formatMoney(
                          order.amountTotalCadCents,
                          order.currency,
                          raw,
                        )}{" "}
                        · {new Date(order.createdAt).toLocaleString(raw)} ·{" "}
                        {order.fulfillmentStatus}
                        {order.discountAmountCadCents
                          ? ` · ${dict.account.rewardDiscount} ${formatMoney(order.discountAmountCadCents, order.currency, raw)}`
                          : ""}
                      </p>
                      {(order.shippingLine1 || order.shippingCity) && (
                        <p className="mt-2 text-xs leading-relaxed text-chocolate-soft">
                          {formatAddress([
                            order.shippingLine1,
                            order.shippingLine2,
                            order.shippingCity,
                            order.shippingState,
                            order.shippingPostalCode,
                            order.shippingCountry,
                          ])}
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

        <section className="store-card px-6 py-6">
          <h2 className="font-serif text-2xl text-chocolate">
            {dict.account.membershipSection}
          </h2>
          {!subscription ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-chocolate-soft">
                {dict.account.membershipNone}
              </p>
              <Link
                href={hrefFor(raw, "/snail-mail-club")}
                className="btn-primary btn-inline"
              >
                {dict.account.membershipExplore}
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-chocolate-soft">
              <p>
                <span className="text-chocolate">{dict.account.membershipStatus}:</span>{" "}
                {subscription.status}
              </p>
              <p>
                <span className="text-chocolate">
                  {dict.account.membershipNextBilling}:
                </span>{" "}
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString(
                      raw,
                    )
                  : "—"}
              </p>
              <ManageBillingButton
                locale={raw}
                label={dict.account.membershipManage}
                unavailableLabel={dict.account.membershipPortalUnavailable}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
