import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "@/components/star";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hrefFor } from "@/lib/nav";

export default async function HomePage({
  params,
}: PageProps<"/[locale]">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const dict = await getDictionary(raw);

  const cards = [
    { path: "/shop", ...dict.home.cards.shop },
    { path: "/mail-club", ...dict.home.cards.mailClub },
    { path: "/past-letters", ...dict.home.cards.pastLetters },
    { path: "/about", ...dict.home.cards.about },
    { path: "/contact", ...dict.home.cards.contact },
  ] as const;

  return (
    <main className="section-pad flex-1 pb-16 pt-8 md:pb-20 md:pt-14">
      <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
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
          {dict.home.greeting}
        </p>
        <h1 className="animate-rise delay-2 mt-2 font-serif text-4xl font-semibold tracking-tight text-chocolate sm:text-5xl md:text-6xl">
          {dict.home.name}
        </h1>
        <p className="animate-rise delay-3 mt-4 max-w-md font-serif text-lg leading-relaxed text-chocolate-soft md:text-xl">
          {dict.home.tagline}
        </p>
        <div className="divider-ornament mt-7">
          <Star className="text-sm" style={{ animationDelay: "0.8s" }} />
        </div>
      </section>

      <section
        aria-label={dict.home.explore}
        className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map((card) => (
          <Link
            key={card.path}
            href={hrefFor(raw, card.path)}
            className="group rounded-[1.75rem] bg-paper/90 px-6 py-7 text-start ring-1 ring-pink/35 transition-transform duration-300 hover:-translate-y-1 hover:ring-pink-deep/50"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-2xl font-medium text-chocolate group-hover:text-pink-deep">
                {card.title}
              </h2>
              <Star className="shrink-0 text-sm" />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-chocolate-soft md:text-[0.95rem]">
              {card.text}
            </p>
            <p className="mt-4 font-serif text-xs tracking-[0.14em] uppercase text-pink-deep">
              {dict.home.explore}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
