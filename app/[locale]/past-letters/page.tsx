import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Star } from "@/components/star";
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

  return (
    <main className="section-pad flex-1 py-12 md:py-16">
      <PageHero
        eyebrow={dict.pastLetters.eyebrow}
        title={dict.pastLetters.title}
        intro={dict.pastLetters.intro}
      />
      <ul className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
        {dict.pastLetters.items.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className="rounded-3xl bg-paper/90 px-6 py-7 text-start ring-1 ring-pink/35"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-xl font-medium text-chocolate">
                {item.title}
              </h2>
              <Star className="shrink-0 text-sm" />
            </div>
            <p className="mt-2 font-script text-lg text-pink-deep">{item.date}</p>
            <p className="mt-3 text-sm leading-relaxed text-chocolate-soft">
              {item.preview}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
