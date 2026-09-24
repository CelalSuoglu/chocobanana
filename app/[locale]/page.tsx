import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/coming-soon-page";
import { Star } from "@/components/star";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";
import { getComingSoonEndsAtIso } from "@/lib/site-access";
import { isComingSoonGateActive } from "@/lib/site-access-server";

export default async function HomePage({
  params,
}: PageProps<"/[locale]">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const dict = await getDictionary(raw);

  if (await isComingSoonGateActive()) {
    return (
      <ComingSoonPage
        dict={dict}
        locale={raw}
        endsAtIso={getComingSoonEndsAtIso()}
      />
    );
  }

  const destinations = [
    { path: "/shop", ...dict.home.cards.shop },
    { path: "/mail-club", ...dict.home.cards.mailClub },
    { path: "/past-letters", ...dict.home.cards.pastLetters },
    { path: "/about", ...dict.home.cards.about },
    { path: "/contact", ...dict.home.cards.contact },
  ] as const;

  return (
    <main className="flex flex-1 flex-col">
      {/* First viewport: one composition — brand, line, CTA, dominant image */}
      <section className="home-hero relative flex min-h-[calc(100dvh-4.5rem)] flex-col justify-end overflow-hidden md:min-h-[calc(100dvh-5.25rem)]">
        <div aria-hidden="true" className="home-hero-glow" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
        >
          <div className="absolute -start-8 top-[12%] h-48 w-48 rounded-full bg-pink/25 blur-3xl md:h-72 md:w-72" />
          <div className="absolute -end-10 top-[28%] h-56 w-56 rounded-full bg-gold/20 blur-3xl md:h-80 md:w-80" />
        </div>

        <div className="section-pad relative z-10 flex flex-1 flex-col items-center pb-14 pt-10 text-center md:pb-20 md:pt-14">
          <div className="animate-float relative mx-auto mt-auto">
            <Star
              className="absolute -start-6 -top-2 text-base text-gold md:-start-10 md:text-lg"
              style={{ animationDelay: "0.35s" }}
            />
            <Star
              className="absolute -end-5 top-10 text-sm text-pink-deep md:-end-9"
              style={{ animationDelay: "1.15s" }}
            />
            <div className="overflow-hidden rounded-full bg-paper/50 p-2 ring-1 ring-pink/40 shadow-[0_20px_60px_rgba(60,42,34,0.12)] md:p-3">
              <Image
                src="/logo.jpg"
                alt={dict.a11y.logoAlt}
                width={420}
                height={420}
                priority
                className="h-48 w-48 rounded-full object-cover object-center sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72"
              />
            </div>
          </div>

          <p className="animate-rise delay-1 mt-8 font-script text-2xl text-pink-deep sm:text-3xl">
            {dict.home.greeting}
          </p>
          <h1 className="animate-rise delay-2 mt-1 font-serif text-5xl font-semibold tracking-tight text-chocolate sm:text-6xl md:text-7xl">
            {dict.home.name}
          </h1>
          <p className="animate-rise delay-3 mx-auto mt-4 max-w-md font-serif text-base leading-relaxed text-chocolate-soft md:text-lg">
            {dict.home.taglineShort}
          </p>

          <div className="animate-rise delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={hrefFor(raw, "/shop")}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-chocolate/80 bg-chocolate px-6 py-2.5 font-serif text-sm tracking-[0.14em] uppercase text-paper transition-colors hover:border-pink-deep hover:bg-pink-deep"
            >
              {dict.home.ctaShop}
            </Link>
            <Link
              href={hrefFor(raw, "/mail-club")}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-chocolate/50 px-6 py-2.5 font-serif text-sm tracking-[0.14em] uppercase text-chocolate transition-colors hover:border-pink-deep hover:text-pink-deep"
            >
              {dict.home.ctaMailClub}
            </Link>
          </div>
        </div>
      </section>

      {/* Second section: one job — choose a path */}
      <section className="section-pad border-t border-pink/25 bg-paper/40 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl text-chocolate md:text-4xl">
            {dict.home.exploreTitle}
          </h2>
          <p className="mt-3 font-serif text-base leading-relaxed text-chocolate-soft md:text-lg">
            {dict.home.exploreIntro}
          </p>
        </div>

        <ul className="mx-auto mt-10 max-w-xl divide-y divide-pink/30 border-y border-pink/30">
          {destinations.map((item) => (
            <li key={item.path}>
              <Link
                href={hrefFor(raw, item.path)}
                className="group flex items-baseline justify-between gap-4 py-5 transition-colors hover:text-pink-deep"
              >
                <span className="font-serif text-xl text-chocolate group-hover:text-pink-deep md:text-2xl">
                  {item.title}
                </span>
                <span
                  aria-hidden="true"
                  className="font-serif text-sm tracking-[0.16em] uppercase text-pink-deep/80 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
