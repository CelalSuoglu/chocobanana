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
  return { title: dict.mailClub.title };
}

export default async function MailClubPage({
  params,
}: PageProps<"/[locale]/mail-club">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);

  return (
    <main className="section-pad flex-1 py-12 md:py-16">
      <PageHero
        eyebrow={dict.mailClub.eyebrow}
        title={dict.mailClub.title}
        intro={dict.mailClub.intro}
      />

      <section className="mx-auto mt-12 max-w-4xl text-center">
        <h2 className="font-serif text-2xl font-semibold text-chocolate md:text-3xl">
          {dict.mailClub.stepsTitle}
        </h2>
        <ol className="mt-8 grid gap-8 text-start md:grid-cols-3 md:gap-6">
          {dict.mailClub.steps.map((step, index) => (
            <li key={step.title} className="px-1 md:px-2">
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
      </section>

      <section className="relative mx-auto mt-14 max-w-3xl overflow-hidden rounded-[2rem] bg-paper/80 px-6 py-10 text-center ring-1 ring-pink/40 md:px-12">
        <Star className="absolute start-6 top-6 text-lg" />
        <h2 className="font-serif text-2xl font-semibold text-chocolate">
          {dict.mailClub.detailsTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-chocolate-soft">
          {dict.mailClub.detailsBody}
        </p>
      </section>
    </main>
  );
}
