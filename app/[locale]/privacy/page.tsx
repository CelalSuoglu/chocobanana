import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getPrivacyPolicy } from "@/lib/legal/privacy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getPrivacyPolicy(locale).title };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const policy = getPrivacyPolicy(locale);
  const lang = locale === "tr" ? "tr" : "en";

  return (
    <main lang={lang} className="section-pad flex-1 pb-16 pt-8 md:pb-20 md:pt-12">
      <article className="mx-auto max-w-2xl">
        <h1 className="page-title">{policy.title}</h1>
        <p className="mt-2 text-xs text-chocolate-soft">{policy.updated}</p>
        <p className="mt-6 text-sm leading-relaxed text-chocolate-soft">{policy.intro}</p>
        {policy.sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="font-serif text-2xl text-chocolate">{section.heading}</h2>
            <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-relaxed text-chocolate-soft">
              {section.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
      </article>
    </main>
  );
}
