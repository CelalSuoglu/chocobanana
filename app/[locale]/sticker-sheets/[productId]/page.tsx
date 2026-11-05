import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StickerAddToCart } from "@/components/sticker-add-to-cart";
import {
  getCatalogProduct,
  getStickerSheetProducts,
} from "@/lib/catalog/products";
import { baseCurrency, formatCatalogPrice } from "@/lib/currency/config";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getStickerSheetProducts().flatMap((product) =>
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
  if (!product || product.family !== "sticker") return {};
  return { title: product.nameEn };
}

export default async function StickerSheetProductPage({
  params,
}: PageProps<"/[locale]/sticker-sheets/[productId]">) {
  const { locale: raw, productId } = await params;
  if (!isLocale(raw)) notFound();
  const product = getCatalogProduct(productId);
  if (!product || product.family !== "sticker" || !product.purchasable) {
    notFound();
  }

  const dict = await getDictionary(raw);
  const priced = formatCatalogPrice({
    amountCadCents: product.amountCadCents,
    locale: raw,
    preferredCurrency: baseCurrency,
  });

  return (
    <main className="section-pad mx-auto w-full max-w-5xl flex-1 py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-chocolate-soft">
        <Link href={hrefFor(raw, "")} className="hover:text-pink-deep">
          {dict.nav.home}
        </Link>
        <span aria-hidden="true" className="px-2 text-pink/70">
          /
        </span>
        <Link href={hrefFor(raw, "/sticker-sheets")} className="hover:text-pink-deep">
          {dict.stickerSheets.title}
        </Link>
        <span aria-hidden="true" className="px-2 text-pink/70">
          /
        </span>
        <span className="text-chocolate">{product.nameEn}</span>
      </nav>

      <div className="mt-6 grid items-start gap-8 md:grid-cols-2">
        <div className="store-card relative aspect-square overflow-hidden">
          <Image
            src={product.imageSrc}
            alt={product.nameEn}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-chocolate-soft">
            {dict.cart.lineSticker}
          </p>
          <h1 className="page-title mt-2">{product.nameEn}</h1>
          <p className="mt-4 font-serif text-3xl text-chocolate">{priced.primary}</p>
          <p className="mt-4 text-sm leading-relaxed text-chocolate-soft">
            {product.descriptionEn}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-chocolate-soft">
            {dict.stickerSheets.intro}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-chocolate-soft">
            {dict.stickerSheets.postageNote}
          </p>
          <StickerAddToCart
            productId={product.id}
            label={dict.cart.addToCart}
            addedLabel={dict.cart.addedToast}
            quantityLabel={dict.stickerSheets.quantity}
            decreaseLabel={dict.stickerSheets.decrease}
            increaseLabel={dict.stickerSheets.increase}
          />
        </div>
      </div>
    </main>
  );
}
