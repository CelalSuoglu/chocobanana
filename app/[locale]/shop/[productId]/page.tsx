import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { PageHero } from "@/components/page-hero";
import {
  getCartEligibleProducts,
  getCatalogProduct,
  type CatalogProduct,
} from "@/lib/catalog/products";
import {
  baseCurrency,
  currencyCookieName,
  formatCatalogPrice,
  isCurrencyCode,
} from "@/lib/currency/config";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export async function generateStaticParams() {
  return getCartEligibleProducts().flatMap((product) =>
    locales.map((locale) => ({ locale, productId: product.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}): Promise<Metadata> {
  const { locale: raw, productId } = await params;
  if (!isLocale(raw)) return {};
  const product = getCatalogProduct(productId);
  if (!product) return {};
  const dict = await getDictionary(raw);
  const copy = productCopy(dict, product);
  return { title: copy.name };
}

function productCopy(dict: Dictionary, product: CatalogProduct) {
  if (product.shopKey) {
    return dict.shop.products[product.shopKey];
  }
  return { name: product.nameEn, note: product.descriptionEn };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}) {
  const { locale: raw, productId } = await params;
  if (!isLocale(raw)) notFound();

  const product = getCatalogProduct(productId);
  if (!product || !product.cartEligible || !product.purchasable) notFound();

  const dict = await getDictionary(raw);
  const copy = productCopy(dict, product);
  const cookieStore = await cookies();
  const rawCurrency = cookieStore.get(currencyCookieName)?.value;
  const currency =
    rawCurrency && isCurrencyCode(rawCurrency) ? rawCurrency : baseCurrency;
  const priced = formatCatalogPrice({
    amountCadCents: product.amountCadCents,
    locale: raw,
    preferredCurrency: currency,
  });

  return (
    <main className="section-pad flex-1 py-12 md:py-16">
      <PageHero
        eyebrow={dict.shop.eyebrow}
        title={copy.name}
        intro={copy.note}
      />

      <div className="mx-auto mt-10 grid max-w-3xl gap-8 md:grid-cols-[minmax(0,240px)_1fr] md:items-start">
        <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-full ring-1 ring-pink/35">
          <Image
            src={product.imageSrc}
            alt={copy.name}
            fill
            className="object-cover"
            sizes="240px"
            priority
          />
        </div>
        <div>
          <p className="font-serif text-2xl text-chocolate">{priced.primary}</p>
          {priced.isEstimateOnly ? (
            <p className="mt-1 text-xs text-chocolate-soft/90">
              {dict.checkout.preferredCurrencyHint.replace(
                "{currency}",
                currency,
              )}
            </p>
          ) : null}
          <p className="mt-4 text-sm leading-relaxed text-chocolate-soft">
            {dict.shop.currencyNote}
          </p>
          <AddToCartButton
            productId={product.id}
            label={dict.cart.addToCart}
            addedLabel={dict.cart.added}
          />
          <p className="mt-6 text-sm">
            <Link href={hrefFor(raw, "/shop")} className="text-pink-deep">
              {dict.shop.backToShop}
            </Link>
            {" · "}
            <Link href={hrefFor(raw, "/cart")} className="text-pink-deep">
              {dict.cart.openCart}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
