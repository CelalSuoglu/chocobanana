import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/components/coming-soon-page";
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

  return (
    <main className="flex flex-1 flex-col">
      <section className="home-hero">
        <div className="section-pad mx-auto flex max-w-3xl flex-col items-center py-12 text-center md:py-20">
          <Image
            src="/logo.jpg"
            alt={dict.a11y.logoAlt}
            width={160}
            height={160}
            priority
            className="h-24 w-24 rounded-full object-cover ring-1 ring-pink/50 sm:h-28 sm:w-28"
          />
          <h1 className="page-title mt-6 max-w-xl">{dict.home.heroHeadline}</h1>
          <p className="page-lead">{dict.home.taglineShort}</p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href={hrefFor(raw, "/snail-mail-club")} className="btn-primary btn-inline">
              {dict.home.clubSectionCta}
            </Link>
            <Link href={hrefFor(raw, "/sticker-sheets")} className="btn-secondary btn-inline">
              {dict.home.stickerSectionCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-pink/30 py-12 md:py-16">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          <article className="store-card flex flex-col px-6 py-7">
            <h2 className="font-serif text-3xl text-chocolate">{dict.home.stickerSectionTitle}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-chocolate-soft">
              {dict.home.stickerSectionBody}
            </p>
            <Link href={hrefFor(raw, "/sticker-sheets")} className="btn-secondary btn-inline mt-6">
              {dict.home.stickerSectionCta}
            </Link>
          </article>
          <article className="store-card flex flex-col px-6 py-7">
            <h2 className="font-serif text-3xl text-chocolate">{dict.home.clubSectionTitle}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-chocolate-soft">
              {dict.home.clubSectionBody}
            </p>
            <Link href={hrefFor(raw, "/snail-mail-club")} className="btn-primary btn-inline mt-6">
              {dict.home.clubSectionCta}
            </Link>
          </article>
        </div>
      </section>

      <section className="section-pad border-t border-pink/30 py-12 md:py-16">
        <h2 className="text-center font-serif text-3xl text-chocolate md:text-4xl">
          {dict.home.howTitle}
        </h2>
        <ol className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
          {dict.home.howSteps.map((step, index) => (
            <li key={step.title} className="store-card px-5 py-6 text-start">
              <span className="font-serif text-sm tracking-[0.16em] text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-serif text-2xl text-chocolate">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-pad border-t border-pink/30 py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-serif text-3xl text-chocolate md:text-4xl">
            {dict.home.faqTitle}
          </h2>
          <ul className="mt-8 divide-y divide-pink/35 border-y border-pink/35">
            {dict.home.faq.map((item) => (
              <li key={item.q} className="py-5">
                <p className="font-serif text-xl text-chocolate">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-chocolate-soft">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
