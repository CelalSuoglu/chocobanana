import type { Metadata } from "next";
import Image from "next/image";
import { BrandIllustration } from "@/components/brand-illustration";
import { SITE_INSTAGRAM_URL } from "@/lib/site-contact";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/buy-button";
import { getStickerSheetProducts } from "@/lib/catalog/products";
import { baseCurrency, formatCatalogPrice } from "@/lib/currency/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
import { paymentsCheckoutEnabled } from "@/lib/stripe/config";

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
  const checkoutOpen = paymentsCheckoutEnabled();

  return (
    <main className="section-pad mx-auto w-full max-w-6xl flex-1 py-8 md:py-12">
      <nav aria-label={dict.a11y.breadcrumb} className="text-sm text-chocolate-soft">
        <Link href={hrefFor(raw, "")} className="hover:text-pink-deep">
          {dict.nav.home}
        </Link>
        <span aria-hidden="true" className="px-2 text-pink/70">
          /
        </span>
        <span className="text-chocolate">{dict.stickerSheets.title}</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="page-title">
          {dict.stickerSheets.title}
        </h1>
        <p className="page-lead">{dict.stickerSheets.intro}</p>
      </header>

      {products.length === 0 ? (
        <section className="mt-10 grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-12">
          <BrandIllustration kind="stickers" className="aspect-[4/3]" />
          <div>
            <h2 className="font-serif text-3xl leading-tight text-chocolate">
              {dict.stickerSheets.emptyTitle}
            </h2>
            <p className="body-copy mt-3">{dict.stickerSheets.emptyBody}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={hrefFor(raw, "/snail-mail-club")} className="btn-primary btn-inline">
                {dict.stickerSheets.emptyCtaClub}
              </Link>
              <a
                href={SITE_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-inline"
              >
                {dict.stickerSheets.emptyCtaInstagram}
              </a>
            </div>
          </div>
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
              <li key={product.id} className="overflow-hidden rounded-2xl border border-line bg-paper">
                <Link href={hrefFor(raw, `/sticker-sheets/${product.id}`)} className="block">
                  <div className="relative aspect-square bg-cream">
                    <Image
                      src={product.imageSrc}
                      alt={product.nameEn}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                </Link>
                <div className="px-4 py-4">
                  <h2 className="font-serif text-xl text-chocolate">
                    <Link href={hrefFor(raw, `/sticker-sheets/${product.id}`)}>{product.nameEn}</Link>
                  </h2>
                  <p className="mt-1 font-serif text-lg text-chocolate">{priced.primary}</p>
                  <BuyButton
                    productId={product.id}
                    locale={raw}
                    label={dict.checkout.buy}
                    unavailableLabel={dict.stickerSheets.emptyBody}
                    errorLabel={dict.checkout.error}
                    enabled={checkoutOpen}
                    className="mt-4"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
