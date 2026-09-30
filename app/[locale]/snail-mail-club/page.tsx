import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className="section-pad flex-1 py-8 md:py-12">
      <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="store-card overflow-hidden">
          <div className="flex h-52 items-center justify-center bg-gradient-to-br from-pink-soft/40 via-cream to-gold-soft/30 p-6 sm:h-64 lg:aspect-square lg:h-auto lg:p-8">
            <Image
              src="/logo.jpg"
              alt={dict.a11y.logoAlt}
              width={280}
              height={280}
              priority
              className="h-32 w-32 rounded-full object-cover ring-1 ring-pink/40 sm:h-40 sm:w-40 lg:h-52 lg:w-52"
            />
          </div>
          <p className="px-5 py-4 text-center text-sm text-chocolate-soft">
            {dict.mailClub.insideEmpty}
          </p>
        </div>

        <div>
          <p className="kicker">{dict.mailClub.eyebrow}</p>
          <h1 className="page-title mt-2">
            {dict.mailClub.title}
          </h1>
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
              checkout: dict.mailClub.joinCta,
              addPackage: dict.mailClub.addPackage,
              added: dict.cart.added,
              unavailable: dict.mailClub.joinDisabled,
              error: dict.checkout.error,
            }}
          />
          <p className="mt-3 text-sm leading-relaxed text-chocolate-soft md:text-base">
            {dict.mailClub.productLead}
          </p>
          <p className="mt-4 text-sm">
            <Link href={hrefFor(raw, "/register")} className="text-pink-deep">
              {dict.auth.createAccount}
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-8">
        <section>
          <h2 className="font-serif text-2xl text-chocolate">{dict.mailClub.thisMonthTitle}</h2>
          <p className="store-card mt-3 px-5 py-4 text-sm text-chocolate-soft">
            {dict.mailClub.insideEmpty}
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-chocolate">{dict.mailClub.stepsTitle}</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {dict.mailClub.steps.map((step, index) => (
              <li key={step.title} className="store-card px-5 py-5">
                <span className="font-script text-3xl text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-serif text-xl text-chocolate">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="store-card px-5 py-6">
          <h2 className="font-serif text-2xl text-chocolate">{dict.mailClub.shippingTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-chocolate-soft">
            {dict.mailClub.shippingNotIncluded}
          </p>
          <p className="mt-4 text-sm text-chocolate-soft">{dict.mailClub.deliveryScope}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {CHECKOUT_SHIPPING_COUNTRIES.map((code) => (
              <li
                key={code}
                className="rounded-full border border-pink/40 px-3 py-1 text-xs text-chocolate"
              >
                {COUNTRY_NAMES[code]}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-chocolate-soft">{dict.mailClub.nextSendUnset}</p>
        </section>

        <section className="store-card px-5 py-6">
          <h2 className="font-serif text-2xl text-chocolate">{dict.mailClub.freeVsPaidTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-chocolate-soft">
            {dict.mailClub.freeVsPaidBody}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-chocolate-soft">
            {dict.mailClub.renewalClosed}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">
            {dict.mailClub.noSkipNote}
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-chocolate">{dict.mailClub.faqTitle}</h2>
          <ul className="mt-4 divide-y divide-pink/30 border-y border-pink/30">
            {dict.mailClub.faq.map((item) => (
              <li key={item.q} className="py-4">
                <p className="font-serif text-lg text-chocolate">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">{item.a}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
