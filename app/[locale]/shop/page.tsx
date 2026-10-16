import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  getCartEligibleProducts,
  type CatalogProduct,
} from "@/lib/catalog/products";
import {
  baseCurrency,
  formatCatalogPrice,
} from "@/lib/currency/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

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
  const products = getCartEligibleProducts();

  return (
    <main className="section-pad mx-auto w-full max-w-6xl flex-1 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-chocolate-soft">
        <Link href={hrefFor(raw, "")} className="hover:text-pink-deep">
          {dict.nav.home}
        </Link>
        <span aria-hidden="true" className="px-2 text-pink/70">
          /
        </span>
        <span className="text-chocolate">{dict.shop.title}</span>
      </nav>

      <header className="mt-6 flex flex-col gap-3 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title">
            {dict.shop.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-chocolate-soft md:text-base">
            {dict.shop.intro}
          </p>
        </div>
        <p className="max-w-xs text-xs leading-relaxed text-chocolate-soft">
          {dict.shop.currencyNote}
        </p>
      </header>

      {products.length === 0 ? (
        <section className="mt-10 text-center">
          <p className="font-serif text-2xl text-chocolate">{dict.shop.emptyTitle}</p>
        </section>
      ) : null}

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const copy = productCopy(dict, product);
          const priced = formatCatalogPrice({
            amountCadCents: product.amountCadCents,
            locale: raw,
            preferredCurrency: baseCurrency,
          });

          return (
            <li
              key={product.id}
              className="store-card flex flex-col overflow-hidden"
            >
              <Link
                href={hrefFor(raw, `/shop/${product.id}`)}
                className="block"
              >
                <div className="relative aspect-square bg-cream-deep/50">
                  <Image
                    src={product.imageSrc}
                    alt={copy.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                </div>
                <div className="px-4 pt-4">
                  <h2 className="font-serif text-xl text-chocolate">
                    {copy.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-chocolate-soft">
                    {copy.note}
                  </p>
                  <p className="mt-3 font-serif text-lg text-chocolate">
                    {priced.primary}
                  </p>
                </div>
              </Link>
              <div className="mt-auto px-4 pb-4">
                <AddToCartButton
                  productId={product.id}
                  label={dict.cart.addToCart}
                  addedLabel={dict.cart.addedToast}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
