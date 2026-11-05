import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandIllustration } from "@/components/brand-illustration";
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

  const doors = [
    {
      href: hrefFor(raw, "/snail-mail-club"),
      kind: "envelope" as const,
      photoSrc: "/mail-club/home-envelope.jpg" as string | undefined,
      photoAlt: dict.mailClub.insideAltEnvelope,
      title: dict.home.clubSectionTitle,
      body: dict.home.clubSectionBody,
      cta: dict.home.clubSectionCta,
    },
    {
      href: hrefFor(raw, "/sticker-sheets"),
      kind: "stickers" as const,
      photoSrc: "/stickers/home-stickers.jpg" as string | undefined,
      photoAlt: dict.stickerSheets.title,
      title: dict.home.stickerSectionTitle,
      body: dict.home.stickerSectionBody,
      cta: dict.home.stickerSectionCta,
    },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <section className="home-hero">
        <div className="section-pad mx-auto flex max-w-3xl flex-col items-center py-14 text-center md:py-24">
          <Image
            src="/logo.jpg"
            alt={dict.a11y.logoAlt}
            width={160}
            height={160}
            priority
            className="h-24 w-24 rounded-full object-cover ring-1 ring-pink/50 sm:h-32 sm:w-32"
          />
          <h1 className="page-title mt-7 max-w-2xl text-balance text-[clamp(2.4rem,6vw,4.25rem)]">
            {dict.home.heroHeadline}
          </h1>
          <p className="page-lead mx-auto">{dict.home.taglineShort}</p>
          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href={hrefFor(raw, "/snail-mail-club")} className="btn-primary btn-inline">
              {dict.home.clubSectionCta}
            </Link>
            <Link href={hrefFor(raw, "/sticker-sheets")} className="btn-secondary btn-inline">
              {dict.home.stickerSectionCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-line py-14 md:py-20">
        <ul className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:gap-10">
          {doors.map((door) => (
            <li key={door.href}>
              <Link href={door.href} className="home-door group block">
                <BrandIllustration
                  kind={door.kind}
                  photoSrc={door.photoSrc}
                  photoAlt={door.photoAlt}
                  className="aspect-[4/3]"
                />
                <h2 className="mt-6 font-serif text-3xl text-chocolate">{door.title}</h2>
                <p className="body-copy mt-2 max-w-md">{door.body}</p>
                <span className="home-door-link mt-4 inline-flex items-center gap-2 font-serif text-lg text-chocolate">
                  {door.cta}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-pad border-t border-line bg-paper py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
          <figure className="polaroid mx-auto w-full max-w-sm">
            <Image
              src="/winnie.jpg"
              alt={dict.home.winnieAlt}
              width={1100}
              height={1100}
              sizes="(min-width: 768px) 24rem, 90vw"
              className="aspect-square w-full object-cover"
            />
            <figcaption className="polaroid-note">{dict.about.p2}</figcaption>
          </figure>
          <div>
            <p className="kicker">{dict.home.storyKicker}</p>
            <h2 className="mt-2 font-serif text-[clamp(2rem,4vw,2.75rem)] leading-tight text-chocolate">
              {dict.home.storyTitle}
            </h2>
            <p className="body-copy mt-4 max-w-xl">{dict.home.storyBody}</p>
            <Link href={hrefFor(raw, "/about")} className="btn-secondary btn-inline mt-7">
              {dict.home.storyCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-line py-14 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-[clamp(2rem,4vw,2.75rem)] text-chocolate">{dict.home.howTitle}</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {dict.home.howSteps.map((step, index) => (
              <li key={step.title}>
                <span className="step-number" aria-hidden="true">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-serif text-2xl text-chocolate">{step.title}</h3>
                <p className="body-copy mt-2">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad border-t border-line py-14 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-[clamp(2rem,4vw,2.75rem)] text-chocolate">{dict.home.faqTitle}</h2>
          <div className="mt-6 max-w-3xl border-t border-line">
            {dict.home.faq.map((item) => (
              <details key={item.q} className="soft-details">
                <summary>{item.q}</summary>
                <p className="soft-details-body body-copy">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
