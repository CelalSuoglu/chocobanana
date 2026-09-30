import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStickerSheetProducts } from "@/lib/catalog/products";
import { baseCurrency, formatCatalogPrice } from "@/lib/currency/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.stickerSheets.title };
}

export default async function StickerSheetsPage({
  params,
}: PageProps<"/[locale]/sticker-sheets">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const products = getStickerSheetProducts();

  return (
    <main className="section-pad mx-auto w-full max-w-6xl flex-1 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-chocolate-soft">
        <Link href={hrefFor(raw, "")} className="hover:text-pink-deep">
          {dict.nav.home}
        </Link>
        <span aria-hidden="true" className="px-2 text-pink/70">
          /
        </span>
        <span className="text-chocolate">{dict.stickerSheets.title}</span>
      </nav>

      <header className="mt-6 max-w-2xl border-b border-pink/30 pb-6">
        <h1 className="page-title">
          {dict.stickerSheets.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-chocolate-soft md:text-base">
          {dict.stickerSheets.intro}
        </p>
      </header>

      {products.length === 0 ? (
        <section className="store-card mt-8 px-6 py-10 text-center">
          <h2 className="font-serif text-2xl text-chocolate">
            {dict.stickerSheets.emptyTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-chocolate-soft">
            {dict.stickerSheets.emptyBody}
          </p>
        </section>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const priced = formatCatalogPrice({
              amountCadCents: product.amountCadCents,
              locale: raw,
              preferredCurrency: baseCurrency,
            });
            return (
              <li key={product.id} className="store-card overflow-hidden">
                <Link href={hrefFor(raw, `/sticker-sheets/${product.id}`)} className="block">
                  <div className="relative aspect-square bg-cream-deep/40">
                    <Image
                      src={product.imageSrc}
                      alt={product.nameEn}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <div className="px-5 py-5">
                    <h2 className="font-serif text-2xl text-chocolate">{product.nameEn}</h2>
                    <p className="mt-2 font-serif text-xl text-chocolate">{priced.primary}</p>
                    <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">
                      {product.descriptionEn}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
