import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SnailMailPackagePicker } from "@/components/snail-mail-package-picker";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
import { paymentsCheckoutEnabled } from "@/lib/stripe/config";
import {
  CHECKOUT_SHIPPING_COUNTRIES,
} from "@/lib/stripe/shipping";

const COUNTRY_NAMES: Record<(typeof CHECKOUT_SHIPPING_COUNTRIES)[number], string> =
  {
    CA: "Canada",
    US: "United States",
    GB: "United Kingdom",
    AU: "Australia",
    FR: "France",
    DE: "Germany",
    TR: "Turkey",
  };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.mailClub.title };
}

export default async function MailClubPage({
  params,
}: PageProps<"/[locale]/snail-mail-club">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const checkoutOpen = paymentsCheckoutEnabled();

  return (
    <main className="section-pad mx-auto w-full max-w-xl flex-1 py-8 md:py-12">
      <Breadcrumbs
        locale={raw}
        label={dict.a11y.breadcrumb}
        items={[
          { label: dict.nav.home, path: "" },
          { label: dict.mailClub.title },
        ]}
      />
      <p className="kicker mt-6">{dict.mailClub.eyebrow}</p>
      <h1 className="page-title mt-2">{dict.mailClub.title}</h1>
      <p className="page-lead">{dict.mailClub.productLead}</p>
      <SnailMailPackagePicker
        locale={raw}
        enabled={checkoutOpen}
        labels={{
          listedPriceLabel: dict.mailClub.listedPriceLabel,
          termLabel: dict.mailClub.termLabel,
          regionLabel: dict.mailClub.regionLabel,
          term1: dict.mailClub.term1,
          term3: dict.mailClub.term3,
          term6: dict.mailClub.term6,
          term12: dict.mailClub.term12,
          regionCanada: dict.mailClub.regionCanada,
          regionUsa: dict.mailClub.regionUsa,
          regionInternational: dict.mailClub.regionInternational,
          oneEnvelope: dict.mailClub.oneEnvelope,
          paidOnce: dict.mailClub.paidOnce,
          postageIncluded: dict.mailClub.shippingNotIncluded,
          internationalNote: dict.mailClub.internationalNote,
          detailsTitle: dict.mailClub.detailsTitle,
          checkout: dict.mailClub.joinCta,
          addPackage: dict.mailClub.addPackage,
          added: dict.cart.addedToast,
          unavailable: dict.mailClub.joinDisabled,
          error: dict.checkout.error,
        }}
      />

      <div className="mt-10 divide-y divide-line border-y border-line">
        <details className="py-4">
          <summary className="cursor-pointer font-serif text-lg text-chocolate">
            {dict.mailClub.thisMonthTitle}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">
            {dict.mailClub.insideEmpty}
          </p>
        </details>
        <details className="py-4">
          <summary className="cursor-pointer font-serif text-lg text-chocolate">
            {dict.mailClub.shippingTitle}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">
            {dict.mailClub.deliveryScope}
          </p>
          <p className="mt-2 text-sm text-chocolate-soft">
            {CHECKOUT_SHIPPING_COUNTRIES.map((code) => COUNTRY_NAMES[code]).join(", ")}
          </p>
          <p className="mt-2 text-sm text-chocolate-soft">{dict.mailClub.nextSendUnset}</p>
        </details>
        <details className="py-4">
          <summary className="cursor-pointer font-serif text-lg text-chocolate">
            {dict.mailClub.freeVsPaidTitle}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">
            {dict.mailClub.freeVsPaidBody}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">
            {dict.mailClub.renewalClosed}
          </p>
        </details>
        <details className="py-4">
          <summary className="cursor-pointer font-serif text-lg text-chocolate">
            {dict.mailClub.faqTitle}
          </summary>
          <ul className="mt-3 space-y-3">
            {dict.mailClub.faq.map((item) => (
              <li key={item.q}>
                <p className="text-sm text-chocolate">{item.q}</p>
                <p className="mt-1 text-sm leading-relaxed text-chocolate-soft">{item.a}</p>
              </li>
            ))}
          </ul>
        </details>
      </div>
      <p className="mt-6 text-sm">
        <Link href={hrefFor(raw, "/register")} className="text-pink-deep">
          {dict.auth.createAccount}
        </Link>
      </p>
    </main>
  );
}
