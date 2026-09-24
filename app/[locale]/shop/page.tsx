import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { PageHero } from "@/components/page-hero";
import { Star } from "@/components/star";
import {
  getCartEligibleProducts,
  type CatalogProduct,
} from "@/lib/catalog/products";
import {
  baseCurrency,
  currencyCookieName,
  formatCatalogPrice,
  isCurrencyCode,
} from "@/lib/currency/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.shop.title };
}

function productCopy(dict: Dictionary, product: CatalogProduct) {
  if (product.shopKey) {
    return dict.shop.products[product.shopKey];
  }
  return { name: product.nameEn, note: product.descriptionEn };
}

export default async function ShopPage({
  params,
}: PageProps<"/[locale]/shop">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const cookieStore = await cookies();
  const rawCurrency = cookieStore.get(currencyCookieName)?.value;
  const currency =
    rawCurrency && isCurrencyCode(rawCurrency) ? rawCurrency : baseCurrency;
  const products = getCartEligibleProducts();

  return (
    <main className="section-pad flex-1 py-12 md:py-16">
      <PageHero
        eyebrow={dict.shop.eyebrow}
        title={dict.shop.title}
        intro={dict.shop.intro}
      />
      <p className="mx-auto mt-4 max-w-xl text-center text-xs text-chocolate-soft/90">
        {dict.shop.currencyNote}
      </p>
      {currency !== baseCurrency ? (
        <p className="mx-auto mt-2 max-w-xl text-center text-xs text-pink-deep">
          {dict.currency.estimatedNote}
        </p>
      ) : null}
      <ul className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
        {products.map((product) => {
          const copy = productCopy(dict, product);
          const priced = formatCatalogPrice({
            amountCadCents: product.amountCadCents,
            locale: raw,
            preferredCurrency: currency,
          });

          return (
            <li
              key={product.id}
              className="rounded-3xl bg-paper/90 px-5 py-6 ring-1 ring-pink/35 sm:px-6 sm:py-7"
            >
              <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full ring-1 ring-pink/35">
                <Image
                  src={product.imageSrc}
                  alt={copy.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-2xl font-medium text-chocolate">
                  {copy.name}
                </h2>
                <Star className="shrink-0 text-sm" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">
                {copy.note}
              </p>
              <p className="mt-4 font-serif text-lg text-chocolate">
                {priced.primary}
              </p>
              {priced.isEstimateOnly ? (
                <p className="mt-1 text-xs text-chocolate-soft/90">
                  {dict.checkout.preferredCurrencyHint.replace(
                    "{currency}",
                    currency,
                  )}
                </p>
              ) : null}
              <AddToCartButton
                productId={product.id}
                label={dict.cart.addToCart}
                addedLabel={dict.cart.added}
              />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
