import type { CSSProperties } from "react";
import Image from "next/image";
import { cookies } from "next/headers";
import { BuyButton } from "@/components/buy-button";
import { LocaleCurrencySwitcher } from "@/components/locale-currency-switcher";
import {
  catalogProducts,
  type CatalogProduct,
} from "@/lib/catalog/products";
import {
  baseCurrency,
  currencyCookieName,
  formatCatalogPrice,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import {
  getPaymentsMode,
  paymentsCheckoutEnabled,
} from "@/lib/stripe/config";

function Star({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`star animate-twinkle ${className}`}
      style={style}
    >
      ✦
    </span>
  );
}

function localizedProductCopy(dict: Dictionary, product: CatalogProduct) {
  if (product.shopKey) {
    return dict.shop.products[product.shopKey];
  }
  return {
    name: product.nameEn,
    note: product.descriptionEn,
  };
}

type HomePageProps = {
  locale: Locale;
  dict: Dictionary;
};

export async function HomePage({ locale, dict }: HomePageProps) {
  const cookieStore = await cookies();
  const rawCurrency = cookieStore.get(currencyCookieName)?.value;
  const currency: CurrencyCode =
    rawCurrency && isCurrencyCode(rawCurrency) ? rawCurrency : baseCurrency;
  const checkoutEnabled = paymentsCheckoutEnabled();
  const paymentsMode = getPaymentsMode();

  const navLinks = [
    { href: "#shop", label: dict.nav.shop },
    { href: "#mail-club", label: dict.nav.mailClub },
    { href: "#about", label: dict.nav.about },
  ] as const;

  const shopProducts = catalogProducts.filter((product) => product.purchasable);

  return (
    <div className="relative flex min-h-full flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-24 z-0 flex justify-between px-6 md:px-16">
        <Star className="text-lg md:text-xl" style={{ animationDelay: "0.2s" }} />
        <Star
          className="mt-16 text-sm md:text-base"
          style={{ animationDelay: "1.1s" }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-pink/30 bg-cream/85 backdrop-blur-md">
        <div className="section-pad mx-auto flex max-w-5xl flex-col gap-3 py-3 md:gap-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <a
              href="#top"
              className="font-serif text-lg tracking-[0.08em] text-chocolate transition-colors hover:text-pink-deep md:text-xl"
            >
              Chocobanana
            </a>
            <LocaleCurrencySwitcher
              locale={locale}
              currency={currency}
              labels={{
                language: dict.nav.language,
                currency: dict.nav.currency,
                selectLanguage: dict.a11y.selectLanguage,
                selectCurrency: dict.a11y.selectCurrency,
              }}
            />
          </div>
          <nav
            aria-label="Primary"
            className="flex justify-center gap-6 border-t border-pink/20 pt-2.5 font-serif text-[0.95rem] tracking-[0.14em] text-chocolate-soft md:gap-8 md:text-base"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-pink-deep"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="top" className="relative z-10 flex-1">
        <section
          aria-labelledby="brand-heading"
          className="section-pad mx-auto flex max-w-3xl flex-col items-center pb-10 pt-8 text-center md:pb-14 md:pt-14"
        >
          <div className="animate-rise relative">
            <Star
              className="absolute -start-5 -top-2 text-base md:-start-8 md:text-lg"
              style={{ animationDelay: "0.4s" }}
            />
            <Star
              className="absolute -end-4 top-6 text-sm md:-end-7"
              style={{ animationDelay: "1.4s" }}
            />
            <div className="animate-float overflow-hidden rounded-full bg-paper/60 p-2 shadow-[0_12px_40px_rgba(60,42,34,0.08)] ring-1 ring-pink/35">
              <Image
                src="/logo.jpg"
                alt={dict.a11y.logoAlt}
                width={320}
                height={320}
                priority
                className="h-44 w-44 rounded-full object-cover object-center sm:h-52 sm:w-52 md:h-60 md:w-60"
              />
            </div>
          </div>

          <p className="animate-rise delay-1 mt-6 font-script text-3xl text-pink-deep md:text-4xl">
            {dict.brand.greeting}
          </p>
          <h1
            id="brand-heading"
            className="animate-rise delay-2 mt-2 font-serif text-4xl font-semibold tracking-tight text-chocolate sm:text-5xl md:text-6xl"
          >
            {dict.brand.name}
          </h1>
          <p className="animate-rise delay-3 mt-4 max-w-md font-serif text-lg leading-relaxed text-chocolate-soft md:text-xl">
            {dict.brand.tagline}
          </p>
          <div className="divider-ornament mt-7">
            <Star className="text-sm" style={{ animationDelay: "0.8s" }} />
          </div>
        </section>

        <section
          id="mail-club"
          aria-labelledby="mail-club-heading"
          className="section-pad scroll-mt-36 py-12 md:scroll-mt-28 md:py-20"
        >
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-paper/80 px-6 py-12 text-center shadow-[0_18px_50px_rgba(60,42,34,0.07)] ring-1 ring-pink/40 md:px-14 md:py-16">
            <Star
              className="absolute start-6 top-6 text-lg"
              style={{ animationDelay: "0.3s" }}
            />
            <Star
              className="absolute bottom-8 end-8 text-base"
              style={{ animationDelay: "1.6s" }}
            />
            <p className="font-script text-2xl text-pink-deep md:text-3xl">
              {dict.mailClub.eyebrow}
            </p>
            <h2
              id="mail-club-heading"
              className="mt-2 font-serif text-3xl font-semibold text-chocolate md:text-5xl"
            >
              {dict.mailClub.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-chocolate-soft md:text-lg">
              {dict.mailClub.body}
            </p>
            <a
              href="#how-it-works"
              className="mt-8 inline-flex items-center justify-center rounded-full border border-chocolate/80 bg-transparent px-7 py-3 font-serif text-sm tracking-[0.16em] uppercase text-chocolate transition-all duration-300 hover:border-pink-deep hover:bg-pink-soft/60 hover:text-chocolate md:text-base"
            >
              {dict.mailClub.cta}
            </a>
          </div>
        </section>

        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          className="section-pad scroll-mt-36 py-14 md:scroll-mt-28 md:py-20"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-script text-2xl text-pink-deep md:text-3xl">
              {dict.howItWorks.eyebrow}
            </p>
            <h2
              id="how-heading"
              className="mt-1 font-serif text-3xl font-semibold text-chocolate md:text-4xl"
            >
              {dict.howItWorks.title}
            </h2>
            <div className="divider-ornament mt-5">
              <Star className="text-sm" />
            </div>

            <ol className="mt-10 grid gap-8 text-start md:grid-cols-3 md:gap-6">
              {dict.howItWorks.steps.map((step, index) => (
                <li key={step.title} className="relative px-1 md:px-2">
                  <span className="font-script text-4xl text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl font-medium text-chocolate">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-chocolate-soft">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="shop"
          aria-labelledby="shop-heading"
          className="section-pad scroll-mt-36 bg-cream-deep/45 py-14 md:scroll-mt-28 md:py-20"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-script text-2xl text-pink-deep md:text-3xl">
              {dict.shop.eyebrow}
            </p>
            <h2
              id="shop-heading"
              className="mt-1 font-serif text-3xl font-semibold text-chocolate md:text-4xl"
            >
              {dict.shop.title}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-chocolate-soft">
              {dict.shop.intro}
            </p>
            <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-chocolate-soft/90">
              {dict.currency.baseNote} {dict.currency.preferenceHint}
            </p>
            {currency !== baseCurrency ? (
              <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-pink-deep">
                {dict.currency.estimatedNote}
              </p>
            ) : null}
            {paymentsMode === "test" ? (
              <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-pink-deep">
                {dict.checkout.testModeNote}
              </p>
            ) : null}

            <ul className="mt-10 grid gap-5 text-start sm:grid-cols-2">
              {shopProducts.map((product) => {
                const copy = localizedProductCopy(dict, product);
                const priced = formatCatalogPrice({
                  amountCadCents: product.amountCadCents,
                  locale,
                  preferredCurrency: currency,
                });
                const buyLabel =
                  product.kind === "subscription"
                    ? dict.checkout.subscribe
                    : dict.checkout.buy;

                return (
                  <li
                    key={product.id}
                    className="rounded-3xl bg-paper/90 px-6 py-7 ring-1 ring-pink/35 transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-2xl font-medium text-chocolate">
                        {copy.name}
                      </h3>
                      <Star className="shrink-0 text-sm" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-chocolate-soft md:text-[0.95rem]">
                      {copy.note}
                    </p>
                    <p className="mt-3 font-serif text-lg text-chocolate">
                      {priced.primary}
                      {product.kind === "subscription"
                        ? ` ${dict.checkout.perMonth}`
                        : ""}
                    </p>
                    {priced.isEstimateOnly ? (
                      <p className="mt-1 text-xs text-chocolate-soft/90">
                        {dict.checkout.preferredCurrencyHint.replace(
                          "{currency}",
                          priced.preferredCurrency,
                        )}
                      </p>
                    ) : null}
                    <BuyButton
                      productId={product.id}
                      locale={locale}
                      label={buyLabel}
                      unavailableLabel={dict.checkout.unavailable}
                      errorLabel={dict.checkout.error}
                      enabled={checkoutEnabled}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-heading"
          className="section-pad scroll-mt-36 py-14 md:scroll-mt-28 md:py-20"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-script text-2xl text-pink-deep md:text-3xl">
              {dict.about.eyebrow}
            </p>
            <h2
              id="about-heading"
              className="mt-1 font-serif text-3xl font-semibold text-chocolate md:text-4xl"
            >
              {dict.about.title}
            </h2>
            <div className="divider-ornament mt-5">
              <Star className="text-sm" />
            </div>
            <p className="mt-8 text-base leading-relaxed text-chocolate-soft md:text-lg">
              {dict.about.p1}
            </p>
            <p className="mt-4 text-base leading-relaxed text-chocolate-soft md:text-lg">
              {dict.about.p2}
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-pink/30 bg-cream-deep/50">
        <div className="section-pad mx-auto flex max-w-4xl flex-col items-center gap-4 py-10 text-center md:py-12">
          <p className="font-serif text-xl tracking-[0.12em] text-chocolate">
            Chocobanana
          </p>
          <p className="font-script text-xl text-pink-deep">{dict.footer.tagline}</p>
          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-center gap-5 font-serif text-sm tracking-[0.12em] text-chocolate-soft"
          >
            {navLinks.map((link) => (
              <a
                key={`footer-${link.href}`}
                href={link.href}
                className="transition-colors hover:text-pink-deep"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="mt-2 text-xs tracking-wide text-chocolate-soft/80">
            {dict.footer.credit}
          </p>
        </div>
      </footer>
    </div>
  );
}
