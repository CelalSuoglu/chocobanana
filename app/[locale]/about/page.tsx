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
  return { title: dict.about.title };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);

  return (
    <main className="section-pad flex-1 py-12 md:py-16">
      <PageHero
        eyebrow={dict.about.eyebrow}
        title={dict.about.title}
        intro={dict.about.intro}
      />
      <div className="mx-auto mt-10 max-w-2xl space-y-4 text-center text-base leading-relaxed text-chocolate-soft md:text-lg">
        <p>{dict.about.p1}</p>
        <p>{dict.about.p2}</p>
        <p className="pt-2 text-sm text-chocolate-soft/90">{dict.about.logoNote}</p>
      </div>
    </main>
  );
}
