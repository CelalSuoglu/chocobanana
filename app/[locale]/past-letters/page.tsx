import Link from "next/link";
import { BrandIllustration } from "@/components/brand-illustration";
import { hrefFor } from "@/lib/nav";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return { title: dict.pastLetters.title };
}

export default async function PastLettersPage({
  params,
}: PageProps<"/[locale]/past-letters">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  // Placeholder rows ("[Letter title]") stay hidden until real letters are written.
  const letters = dict.pastLetters.items.filter((item) => !item.title.trim().startsWith("["));

  return (
    <main className="section-pad flex-1 py-12 md:py-16">
      <PageHero
        eyebrow={dict.pastLetters.eyebrow}
        title={dict.pastLetters.title}
        intro={dict.pastLetters.intro}
      />
      {letters.length > 0 ? (
        <ul className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
          {letters.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="store-card px-6 py-7 text-start"
            >
              <h2 className="font-serif text-xl text-chocolate">{item.title}</h2>
              <p className="mt-2 font-script text-lg text-rose-ink">{item.date}</p>
              <p className="body-copy mt-3">{item.preview}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mx-auto mt-10 max-w-md text-center">
          <BrandIllustration kind="envelope" className="aspect-[4/3]" />
          <Link href={hrefFor(raw, "/snail-mail-club")} className="btn-primary btn-inline mt-8">
            {dict.home.clubSectionCta}
          </Link>
        </div>
      )}
    </main>
  );
}
