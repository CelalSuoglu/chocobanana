import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyButton } from "@/components/buy-button";
import {
  getCartEligibleProducts,
  getCatalogProduct,
  type CatalogProduct,
} from "@/lib/catalog/products";
import {
  baseCurrency,
  formatCatalogPrice,
} from "@/lib/currency/config";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
import { paymentsCheckoutEnabled } from "@/lib/stripe/config";

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
  if (!product || !product.cartEligible || !product.purchasable || product.snailMail || product.family === "sticker") {
    notFound();
  }

  const dict = await getDictionary(raw);
  const copy = productCopy(dict, product);
  const priced = formatCatalogPrice({
    amountCadCents: product.amountCadCents,
    locale: raw,
    preferredCurrency: baseCurrency,
  });
  const checkoutEnabled = paymentsCheckoutEnabled();
  const others = getCartEligibleProducts().filter((item) => item.id !== product.id);

  return (
    <main className="section-pad mx-auto w-full max-w-6xl flex-1 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-chocolate-soft">
        <Link href={hrefFor(raw, "")} className="hover:text-pink-deep">
          {dict.nav.home}
        </Link>
        <span aria-hidden="true" className="px-2 text-pink/70">
          /
        </span>
        <Link href={hrefFor(raw, "/shop")} className="hover:text-pink-deep">
          {dict.shop.title}
        </Link>
        <span aria-hidden="true" className="px-2 text-pink/70">
          /
        </span>
        <span className="text-chocolate">{copy.name}</span>
      </nav>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-2">
        <div className="store-card relative aspect-square overflow-hidden bg-cream-deep/40">
          <Image
            src={product.imageSrc}
            alt={copy.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority
          />
        </div>

        <div className="store-card px-6 py-7 md:px-8">
          <p className="text-xs uppercase tracking-[0.16em] text-chocolate-soft">
            {dict.shop.title}
          </p>
          <h1 className="page-title mt-2">{copy.name}</h1>
          <p className="mt-4 font-serif text-3xl text-chocolate">{priced.primary}</p>
          <p className="mt-4 text-sm leading-relaxed text-chocolate-soft">
            {copy.note}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-chocolate-soft">
            {dict.shop.currencyNote}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <AddToCartButton
              productId={product.id}
              label={dict.cart.addToCart}
              addedLabel={dict.cart.addedToast}
              className="mt-0"
            />
            <BuyButton
              productId={product.id}
              locale={raw}
              label={dict.checkout.buy}
              unavailableLabel={dict.checkout.unavailable}
              errorLabel={dict.checkout.error}
              enabled={checkoutEnabled}
              className="mt-0"
            />
          </div>
          {checkoutEnabled ? (
            <p className="mt-4 text-xs leading-relaxed text-chocolate-soft">
              {dict.checkout.walletsNote}
            </p>
          ) : null}
        </div>
      </div>

      {others.length > 0 ? (
        <section className="mt-14 border-t border-line pt-8">
          <h2 className="font-serif text-2xl text-chocolate">{dict.shop.title}</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {others.map((item) => {
              const itemCopy = productCopy(dict, item);
              const itemPrice = formatCatalogPrice({
                amountCadCents: item.amountCadCents,
                locale: raw,
                preferredCurrency: baseCurrency,
              });
              return (
                <li key={item.id}>
                  <Link
                    href={hrefFor(raw, `/shop/${item.id}`)}
                    className="store-card flex items-center gap-3 p-3 hover:shadow-[0_0_0_1px_var(--pink-deep)]"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={item.imageSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <span>
                      <span className="block font-serif text-chocolate">
                        {itemCopy.name}
                      </span>
                      <span className="text-sm text-chocolate-soft">
                        {itemPrice.primary}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
