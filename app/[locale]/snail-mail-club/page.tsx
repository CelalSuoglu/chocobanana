import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandIllustration } from "@/components/brand-illustration";
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
          <BrandIllustration kind="envelope" className="mt-8 hidden aspect-[16/9] lg:block" />
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
    </main>
  );
}
