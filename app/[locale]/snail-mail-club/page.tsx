import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SnailMailPackagePicker } from "@/components/snail-mail-package-picker";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { paymentsCheckoutEnabled } from "@/lib/stripe/config";
import {
  CHECKOUT_SHIPPING_COUNTRIES,
} from "@/lib/stripe/shipping";

const COUNTRY_NAMES: Record<(typeof CHECKOUT_SHIPPING_COUNTRIES)[number], string> =
  {
    CA: "Canada",
    US: "United States",
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
    <main className="section-pad mx-auto w-full max-w-6xl flex-1 py-8 md:py-12">
      <Breadcrumbs
        locale={raw}
        label={dict.a11y.breadcrumb}
        items={[
          { label: dict.nav.home, path: "" },
          { label: dict.mailClub.title },
        ]}
      />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
        <div>
          <p className="kicker">{dict.mailClub.eyebrow}</p>
          <h1 className="page-title mt-2">{dict.mailClub.title}</h1>
          <p className="page-lead">{dict.mailClub.productLead}</p>
          <Image
            src="/mail-club/december-envelope.jpg"
            alt={dict.mailClub.insideAltEnvelope}
            width={1080}
            height={1350}
            priority
            sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 90vw"
            className="mx-auto mt-8 w-full max-w-sm rounded-[1.75rem] shadow-[0_18px_40px_-18px_rgba(75,40,27,0.45)] lg:mx-0 lg:max-w-md"
          />
        </div>

        <aside className="lg:row-span-2">
          <div className="store-card px-5 py-6 sm:px-7 sm:py-7 lg:sticky lg:top-28">
          <SnailMailPackagePicker
            locale={raw}
            enabled={checkoutOpen}
            labels={{
              listedPriceLabel: dict.mailClub.listedPriceLabel,
              termLabel: dict.mailClub.termLabel,
              regionLabel: dict.mailClub.regionLabel,
              term1: dict.mailClub.term1,
              term3: dict.mailClub.term3,
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
          </div>
        </aside>

        <div className="border-t border-line">
          <details className="soft-details" open>
            <summary>{dict.mailClub.detailsTitle}</summary>
            <div className="soft-details-body body-copy space-y-2">
              <p>{dict.mailClub.oneEnvelope}</p>
              <p>{dict.mailClub.renewalClosed}</p>
            </div>
          </details>
          <details className="soft-details">
            <summary>{dict.mailClub.shippingTitle}</summary>
            <div className="soft-details-body body-copy">
              <p>{dict.mailClub.deliveryScope}</p>
              <p className="mt-1 text-chocolate">
                {CHECKOUT_SHIPPING_COUNTRIES.map((code) => COUNTRY_NAMES[code]).join(", ")}
              </p>
            </div>
          </details>
          <details className="soft-details">
            <summary>{dict.mailClub.faqTitle}</summary>
            <ul className="soft-details-body space-y-4">
              {dict.mailClub.faq.map((item) => (
                <li key={item.q}>
                  <p className="font-serif text-lg text-chocolate">{item.q}</p>
                  <p className="body-copy mt-1">{item.a}</p>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>

      <section className="mt-16 grid items-center gap-8 border-t border-line pt-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12">
        <div>
          <p className="kicker">{dict.mailClub.insideKicker}</p>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-chocolate md:text-4xl">
            {dict.mailClub.insideTitle}
          </h2>
          <p className="body-copy mt-3">{dict.mailClub.insideBody}</p>
        </div>
        <Image
          src="/mail-club/december-inside.jpg"
          alt={dict.mailClub.insideAltContents}
          width={1080}
          height={1350}
          sizes="(min-width: 768px) 55vw, 95vw"
          className="mx-auto w-full max-w-xl rounded-[1.75rem] shadow-[0_18px_40px_-18px_rgba(75,40,27,0.45)]"
        />
      </section>
    </main>
  );
}
