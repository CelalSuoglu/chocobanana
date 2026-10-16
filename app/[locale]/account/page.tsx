import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountAddressForm } from "@/components/account-address-form";
import { PushSettingsCard } from "@/components/app/push-settings-card";
import { AccountProfileForm } from "@/components/account-profile-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DeleteAccountSection } from "@/components/delete-account-section";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { logoutCustomerAction } from "@/lib/auth/actions";
import { getOptionalSession } from "@/lib/auth/session";
import { isDatabaseConfigured, requirePrisma } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getNativeAppContext } from "@/lib/native/app-context";
import { hrefFor } from "@/lib/nav";
import { displayOrderNumber } from "@/lib/orders/number";
import { listOrdersForUser } from "@/lib/orders/repository";
import { getCustomerRewardView, getUsedRewardCodes } from "@/lib/rewards/repository";
import { progressTowardNextReward } from "@/lib/rewards/logic";
import { getMailClubSubscriptionForUser } from "@/lib/subscriptions/repository";
import { readWelcomeDiscount } from "@/lib/welcome/discount";

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
          welcomeDiscountUsedAt: true,
        },
      })
    : null;

  const welcome = isDatabaseConfigured()
    ? await readWelcomeDiscount(requirePrisma(), session.user.id)
    : { eligible: false };
  const welcomeState = welcome.eligible
    ? "available"
    : profile?.welcomeDiscountUsedAt
      ? "used"
      : "unavailable";

  const orders = isDatabaseConfigured()
    ? await listOrdersForUser(session.user.id)
    : [];

  const rewards = isDatabaseConfigured()
    ? await getCustomerRewardView(session.user.id)
    : { qualifyingCount: 0, codes: [] };
  const rewardProgress = progressTowardNextReward(rewards.qualifyingCount);
  const usedRewards = isDatabaseConfigured()
    ? await getUsedRewardCodes(session.user.id)
    : [];

  const subscription = isDatabaseConfigured()
    ? await getMailClubSubscriptionForUser(session.user.id)
    : null;

  const app = await getNativeAppContext();

  const sections = [
    { href: "#orders", label: dict.account.ordersSection },
    { href: "#addresses", label: dict.account.addressSection },
    { href: "#rewards", label: dict.account.rewardSection },
    { href: "#settings", label: dict.account.settingsSection },
  ];

  return (
    <main className="section-pad flex-1 pb-16 pt-8 md:pb-20 md:pt-12">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs
          locale={raw}
          label={dict.a11y.breadcrumb}
          items={[
            { label: dict.nav.home, path: "" },
            { label: dict.account.title },
          ]}
        />
        <header className="mt-6">
          <h1 className="page-title">{dict.account.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">{dict.account.intro}</p>
        </header>
        <nav aria-label={dict.account.title} className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {sections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-paper px-3 text-center font-serif text-sm text-chocolate hover:border-chocolate"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-12">
        {app.isApp && app.pushCapable ? (
          <PushSettingsCard locale={raw} labels={dict.app.push} />
        ) : null}
        <section id="orders">
          <h2 className="font-serif text-2xl text-chocolate">
            {dict.account.ordersSection}
          </h2>
          {!isDatabaseConfigured() ? (
            <p className="mt-4 text-sm text-chocolate-soft">
              {dict.account.ordersUnavailable}
            </p>
          ) : orders.length === 0 ? (
            <div className="mt-4">
              <p className="text-sm text-chocolate-soft">{dict.account.noOrders}</p>
              <Link href={hrefFor(raw, "")} className="btn-primary btn-inline mt-5">
                {dict.account.discover}
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="border-b border-line pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-lg text-chocolate">
                        {dict.account.orderNumber} {displayOrderNumber(order.publicNumber)}
                      </p>
                      <p className="text-xs text-chocolate-soft">
                        {formatMoney(order.amountTotalCadCents, order.currency, raw)}{" "}
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
                    <p className="text-xs uppercase tracking-wider text-chocolate">
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

        <section id="addresses">
          <h2 className="font-serif text-2xl text-chocolate">
            {dict.account.addressSection}
          </h2>
          <p className="mt-1 text-sm text-chocolate-soft">{dict.account.addressHint}</p>
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
                ]) || dict.account.addressEmpty}
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
            <p className="mt-4 text-sm text-chocolate-soft">{dict.account.ordersUnavailable}</p>
          )}
        </section>

        <section id="rewards">
          <h2 className="font-serif text-2xl text-chocolate">{dict.account.rewardSection}</h2>
          <h3 className="mt-4 font-serif text-lg text-chocolate">{dict.account.welcomeTitle}</h3>
          <p className="mt-1 text-sm text-chocolate">
            {welcomeState === "available"
              ? dict.account.welcomeAvailable
              : welcomeState === "used"
                ? dict.account.welcomeUsed
                : dict.account.welcomeUnavailable}
          </p>
          <p className="mt-5 text-sm text-chocolate">
            {dict.account.rewardProgress
              .replace("{current}", String(rewardProgress.current))
              .replace("{target}", String(rewardProgress.target))}
          </p>
          <p className="mt-1 text-sm text-chocolate-soft">
            {dict.account.ordersCounted.replace("{count}", String(rewards.qualifyingCount))}
          </p>
          <div className="mt-3 flex gap-2" aria-hidden="true">
            {Array.from({ length: rewardProgress.target }, (_, index) => (
              <span
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index < rewardProgress.current ? "bg-chocolate" : "bg-line"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-chocolate-soft">
            {dict.account.rewardHint}
          </p>
          {rewards.codes.length === 0 && usedRewards.length === 0 ? (
            <div className="mt-4">
              <p className="font-serif text-lg text-chocolate">{dict.account.rewardEmptyTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">
                {dict.account.rewardEmptyBody}
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {rewards.codes.map((code) => (
                <li
                  key={code.code}
                  className="flex items-center justify-between gap-3 border-b border-line py-3"
                >
                  <span className="font-serif tracking-wide text-chocolate">{code.code}</span>
                  <span className="text-end text-xs uppercase tracking-wider text-chocolate">
                    {code.firstOrderOnly ? `${dict.account.rewardFirstOrder} · ` : ""}
                    {code.status === "RESERVED"
                      ? dict.account.rewardReserved
                      : dict.account.rewardAvailable}
                  </span>
                </li>
              ))}
              {usedRewards.map((code) => (
                <li
                  key={`used-${code.code}`}
                  className="flex items-center justify-between gap-3 border-b border-line py-3"
                >
                  <span className="font-serif tracking-wide text-chocolate-soft">{code.code}</span>
                  <span className="text-end text-xs uppercase tracking-wider text-chocolate-soft">
                    {code.firstOrderOnly ? `${dict.account.rewardFirstOrder} · ` : ""}
                    {dict.account.rewardUsed}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="settings">
          <h2 className="font-serif text-2xl text-chocolate">{dict.account.settingsSection}</h2>
          <p className="mt-1 text-sm text-chocolate-soft">
            {dict.account.email}: {profile?.email ?? session.user.email}
          </p>
          {profile ? (
            <AccountProfileForm dict={dict} locale={raw} profile={profile} />
          ) : (
            <p className="mt-4 text-sm text-chocolate-soft">{dict.account.ordersUnavailable}</p>
          )}
          <form action={logoutCustomerAction} className="mt-6">
            <input type="hidden" name="locale" value={raw} />
            <button type="submit" className="btn-secondary btn-inline">
              {dict.account.signOut}
            </button>
          </form>

          <DeleteAccountSection locale={raw} labels={dict.account.deleteAccount} />

          <h3 className="mt-10 font-serif text-xl text-chocolate">
            {dict.account.membershipSection}
          </h3>
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
