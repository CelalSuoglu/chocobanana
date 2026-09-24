import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CartPageClient } from "@/components/cart-page-client";
import { PageHero } from "@/components/page-hero";
import {
  baseCurrency,
  currencyCookieName,
  isCurrencyCode,
} from "@/lib/currency/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { paymentsCheckoutEnabled } from "@/lib/stripe/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.cart.title };
}

export default async function CartPage({
  params,
}: PageProps<"/[locale]/cart">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const cookieStore = await cookies();
  const rawCurrency = cookieStore.get(currencyCookieName)?.value;
  const currency =
    rawCurrency && isCurrencyCode(rawCurrency) ? rawCurrency : baseCurrency;

  return (
    <main className="section-pad flex-1 py-12 md:py-16">
      <PageHero
        eyebrow={dict.cart.eyebrow}
        title={dict.cart.title}
        intro={dict.cart.intro}
      />
      <CartPageClient
        locale={raw}
        currency={currency}
        dict={dict}
        checkoutEnabled={paymentsCheckoutEnabled()}
      />
    </main>
  );
}
